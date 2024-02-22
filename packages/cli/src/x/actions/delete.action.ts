import chalk from 'chalk'
import { program } from 'commander'
import ora from 'ora'
import { apiKeyClient } from './auth.action'
import { getAuth } from '../../shared/get-auth'
import { messages } from '../../shared/messages'
import { prompt } from 'prompts'

export async function deleteAction(
  options?: Partial<{
    slug: string
    agentId: string
    token: string
    apiUrl: string
  }>
): Promise<void> {
  const { slug, agentId } = options ?? {}

  let authRes
  try {
    authRes = await getAuth(options)
  } catch (e) {
    return program.error(messages.error(e))
  }
  const { apiKey, apiUrl, environment } = authRes

  if (!slug && !agentId) {
    ora({ text: 'No slug or agentId provided' }).fail()
    process.exit(1)
  }

  // Create and authenticated API client
  const apiClient = apiKeyClient({ apiUrl, apiKey: apiKey! })

  const validatingSpinner = ora({
    text: `Checking for deployed agents...`,
  }).start()

  try {
    const { data } = await apiClient.agents.list({
      environmentId: environment?.id!,
    })

    if (!data || data.length === 0) {
      validatingSpinner.fail('No agents found')
      process.exit(1)
    }

    const agent: any = data.find((agent) => {
      if (slug) {
        return agent.slug === slug
      } else if (options?.agentId) {
        return agent.id === options?.agentId
      }
    })

    if (agent.lne) {
      validatingSpinner.fail('No agent matching slug or agentId found')
      process.exit(1)
    }

    validatingSpinner.succeed(`Found agent match, ${agent.slug}`)

    const { deleteAgent } = await prompt({
      type: 'confirm',
      name: `deleteAgent`,
      message: chalk.red(
        `Are you sure you want to delete agent ${
          agent.slug + ': ' + agent.id
        }? (y/n)`
      ),
    })

    if (!deleteAgent) {
      validatingSpinner.fail('Agent delete cancelled')
      process.exit(1)
    }

    const deleteSpinner = ora({
      text: `Deleting agent ${agent.id}...`,
    }).start()

    try {
      await apiClient.agents.delete(agent.id, {
        environmentId: environment?.id!,
      })
      deleteSpinner.succeed(`Deleted agent ${agent.id}`)
    } catch (e) {
      return program.error(messages.error(e))
    }
  } catch (e) {
    return program.error(messages.error(e))
  }
}
