import { Flatfile } from '@flatfile/api'
import { program } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import prompts from 'prompts'

import { apiKeyClient } from './auth.action'
import { getAuth } from '../../shared/get-auth'
import { messages } from '../../shared/messages'

/**
 * isStatusLogLine
 *
 * Returns true if the line is a status line reported by AWS Lambda.
 *
 * @param {string} line - The line to check
 * @returns {boolean} - True if the line is a status line
 */
function isStatusLogLine(line: string): boolean {
  return (
    line.startsWith('REPORT') ||
    line.startsWith('START') ||
    line.startsWith('END')
  )
}

/**
 * handleAgentSelection
 *
 * Prompts the user to select a deployed agent unless one is specified or there's only one agent.
 *
 * @param {Flatfile.Agent[] | undefined} data - the list of agents
 * @param {string | undefined} slug - the slug of the agent to select
 * @returns {Promise<Flatfile.Agent | undefined>} - the selected agent
 */
async function handleAgentSelection(
  data: Flatfile.Agent[] | undefined,
  slug: string | undefined
) {
  // Directly return if there's no data or if a slug is already provided
  if (!data || slug) {
    return data?.find((a) => a.slug === slug)
  }

  if (data.length > 1) {
    const { agent } = await prompts({
      type: 'select',
      name: 'agent',
      message: 'Select an agent to display logs for:',
      choices: data.map((a) => ({
        title: a.slug || '<no-slug>',
        value: a.slug,
      })),
    })

    return data.find((a) => a.slug === agent)
  } else {
    // If there's only one agent and no slug is provided, return the first agent
    return data[0]
  }
}

/**
 * printLogs
 *
 * Parses and prints the logs from an array of agent logs.
 *
 * @param {Flatfile.AgentLog[]} logs - the logs to print
 */
function printLogs(logs: Flatfile.AgentLog[]) {
  for (const log of logs) {
    if (log.success == false) {
      console.log(
        `${chalk.gray(log.createdAt)} ${chalk.red('ERROR')} ${log.log}`
      )
      continue
    }

    const logLines =
      log.log
        ?.split('\n')
        .filter(Boolean)
        .filter((line) => !isStatusLogLine(line)) || []

    for (const logLine of logLines.reverse()) {
      const parts = logLine.split('\t')

      if (parts.length < 4) {
        continue
      }

      let [timestamp, _id, level, ...message] = parts

      if (level === 'INFO') {
        level = chalk.blue(level)
      } else if (level === 'WARN') {
        level = chalk.yellow(level)
      } else if (level === 'ERROR') {
        level = chalk.red(level)
      }

      console.log(`${chalk.gray(timestamp)} ${level} ${message.join('\n')}`)
    }
  }
}

export async function logsAction(
  options?: Partial<{
    slug: string
    apiUrl: string
    token: string
    number: number
    tail: boolean
  }>
): Promise<void> {
  let authRes
  try {
    authRes = await getAuth(options)
  } catch (e) {
    return program.error(messages.error(e))
  }

  const { apiKey, apiUrl, environment } = authRes
  const slug = options?.slug || process.env.FLATFILE_AGENT_SLUG
  const apiClient = apiKeyClient({ apiUrl, apiKey: apiKey! })

  /**
   * fetchLogs
   *
   * Fetchs and returns the logs for an agent. Optionally, fetch logs since a given ID.
   *
   * @param {Flatfile.AgentId} agentId - the ID of the agent to fetch logs for
   * @param {Flatfile.EventId} sinceEventId - the ID of the event log to fetch logs since
   * @returns {Promise<Flatfile.AgentLog[]>} - the logs
   */
  const fetchLogs = async (
    agentId: Flatfile.AgentId,
    sinceEvent?: Flatfile.AgentLog
  ): Promise<Flatfile.AgentLog[]> => {
    const { data: logs = [] } = await apiClient.agents.getAgentLogs(agentId, {
      environmentId: environment.id!,
    })

    if (!sinceEvent) return logs

    const filtered = logs.filter(
      (log) =>
        log.createdAt >= sinceEvent.createdAt &&
        log.eventId !== sinceEvent.eventId
    )

    return filtered
  }

  try {
    const agentSpinner = ora({
      text: `Select agent to display logs for...`,
    }).start()
    const { data } = await apiClient.agents.list({
      environmentId: environment.id!,
    })
    const selectedAgent = await handleAgentSelection(data, slug)

    if (!selectedAgent) {
      const errorMessage = slug
        ? `Agent with slug ${chalk.cyan(slug)} not found`
        : 'No agents found'

      agentSpinner.fail(errorMessage)
      process.exit(1)
    }

    const agentName = selectedAgent.slug || selectedAgent.id
    agentSpinner.succeed(`Selected agent: ${chalk.cyan(agentName)}`)

    const logs = await fetchLogs(selectedAgent.id)
    const maxLogs = options?.number || logs.length
    const initialLogs = logs.slice(0, maxLogs).reverse()

    // Print the intially requested logs
    printLogs(initialLogs)

    if (options?.tail) {
      let lastEvent = initialLogs[initialLogs.length - 1]
      let timer: ReturnType<typeof setTimeout>

      // The logs endpoint does not support streaming responses, so we need to poll every few seconds.
      const poll = async () => {
        const newLogs = (await fetchLogs(selectedAgent.id, lastEvent)).reverse()

        if (newLogs.length > 0) {
          printLogs(newLogs)
          lastEvent = newLogs[newLogs.length - 1]
        }

        timer = setTimeout(poll, 2500)
      }

      poll()

      process.on('SIGINT', () => {
        if (timer) clearTimeout(timer)
        process.exit()
      })
    }
  } catch (e) {
    return program.error(messages.error(e))
  }
}
