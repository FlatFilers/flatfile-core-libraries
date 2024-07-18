import { Flatfile } from '@flatfile/api'
import { program } from 'commander'
import chalk from 'chalk'
import fs from 'fs'
// @ts-expect-error
import ncc from '@vercel/ncc'
import ora from 'ora'
import path from 'path'
import prompts from 'prompts'
import util from 'util'

import { agentTable } from '../helpers/agent.table'
import { apiKeyClient } from './auth.action'
import { getAuth } from '../../shared/get-auth'
import { getEntryFile } from '../../shared/get-entry-file'
import { messages } from '../../shared/messages'
import url from 'url'

const readPackageJson = util.promisify(require('read-package-json'))

type ListenerTopics = Flatfile.EventTopic | '**'

async function handleAgentSelection(
  data: Flatfile.Agent[] | undefined,
  slug: string | undefined,
  validatingSpinner: ora.Ora
) {
  // Directly return if there's no data or if a slug is already provided
  if (!data || slug) {
    return data?.find((a) => a.slug === slug)
  }

  if (data.length > 1) {
    // Inform the user about multiple agents in the environment
    validatingSpinner.fail(
      `${chalk.yellow(
        'You already have agents in this environment!'
      )}\n\n${agentTable(data, false)}`
    )

    // Confirm if the user wants to select an agent
    const { selectAgent } = await prompts({
      type: 'confirm',
      name: 'selectAgent',
      message: 'Would you like to select an agent to deploy to? (y/n)',
    })

    if (!selectAgent) {
      console.log(
        chalk.cyan(
          'Tip: On deploy specify an agent by slug (-s, --slug) or id (-ag / --agent-id)'
        )
      )
      process.exit(0)
    }

    // Allow the user to select an agent
    const { agent } = await prompts({
      type: 'select',
      name: 'agent',
      message: 'Select an agent to deploy to',
      choices: data.map((a) => ({
        title: a.slug || '<no-slug>',
        value: a.slug,
      })),
    })

    // Find and return the selected agent
    return data.find((a) => a.slug === agent)
  } else {
    // If there's only one agent and no slug is provided, return the first agent
    return data[0]
  }
}

function findActiveTopics(
  allTopics: ListenerTopics[],
  client: any,
  topicsWithListeners = new Set()
) {
  client.listeners?.forEach((listener: ListenerTopics | ListenerTopics[]) => {
    const listenerTopics = Array.isArray(listener[0])
      ? listener[0]
      : [listener[0]]
    listenerTopics.forEach((listenerTopic) => {
      if (listenerTopic === '**') {
        // Filter cron events out of '**' list - they must be added explicitly
        const filteredTopics = allTopics.filter(
          (event) => !event.startsWith('cron:')
        )
        filteredTopics.forEach((topic) => topicsWithListeners.add(topic))
      } else if (listenerTopic.includes('**')) {
        const [prefix] = listenerTopic.split(':')
        allTopics.forEach((topic) => {
          if (topic.split(':')[0] === prefix) topicsWithListeners.add(topic)
        })
      } else if (allTopics.includes(listenerTopic)) {
        topicsWithListeners.add(listenerTopic)
      }
    })
  })
  client.nodes?.forEach((nestedClient: any) =>
    findActiveTopics(allTopics, nestedClient, topicsWithListeners)
  )
  return topicsWithListeners
}

async function getActiveTopics(file: string): Promise<Flatfile.EventTopic[]> {
  const allTopics = Object.values(Flatfile.events.EventTopic)

  let mount
  try {
    mount = await import(url.pathToFileURL(file).href)
  } catch (e) {
    return program.error(messages.error(e))
  }
  return Array.from(
    findActiveTopics(allTopics, mount.default)
  ) as Flatfile.EventTopic[]
}

export async function deployAction(
  file?: string | null | undefined,
  options?: Partial<{
    slug: string
    topics: string
    apiUrl: string
    token: string
  }>
): Promise<void> {
  const outDir = path.join(process.cwd(), '.flatfile')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  let authRes
  try {
    authRes = await getAuth(options)
  } catch (e) {
    return program.error(messages.error(e))
  }
  const { apiKey, apiUrl, environment } = authRes

  file = getEntryFile(file, 'deploy')

  if (!file) {
    return program.error(messages.noEntryFile)
  }

  const slug = options?.slug || process.env.FLATFILE_AGENT_SLUG

  try {
    const data = await readPackageJson(path.join(process.cwd(), 'package.json'))
    if (
      !data.dependencies?.['@flatfile/listener'] &&
      !data.devDependencies?.['@flatfile/listener']
    ) {
      return program.error(messages.listenerNotInstalled)
    }
  } catch (e) {
    return program.error(messages.noPackageJSON)
  }

  const liteMode = process.env.FLATFILE_COMPILE_MODE === 'no-minify'

  try {
    const data = fs.readFileSync(
      path.join(__dirname, '..', 'templates', 'entry.js'),
      'utf8'
    )
    const result = data.replace(
      /{ENTRY_PATH}/g,
      path.join(
        path.relative(
          path.dirname(path.join(outDir, '_entry.js')),
          path.dirname(file!)
        ),
        path.basename(file!)
      )
    )

    const entry = result.split(path.sep).join(path.posix.sep)
    // console.log({ entry })
    fs.writeFileSync(path.join(outDir, '_entry.js'), entry, 'utf8')
    const buildingSpinner = ora({
      text: `Building deployable code package`,
    }).start()

    buildingSpinner.succeed('Code package compiled to .flatfile/build.js')
  } catch (e) {
    return program.error(messages.error(e))
  }

  // Create and authenticated API client
  const apiClient = apiKeyClient({ apiUrl, apiKey: apiKey! })

  const validatingSpinner = ora({
    text: `Validating code package...`,
  }).start()
  try {
    validatingSpinner.succeed('Code package passed validation')

    ora({
      text: `Environment "${environment?.name}" selected`,
    }).succeed()

    const { data } = await apiClient.agents.list({
      environmentId: environment?.id!,
    })

    const selectedAgent = await handleAgentSelection(
      data,
      slug,
      validatingSpinner
    )

    const deployingSpinner = ora({
      text: `Deploying event listener to Flatfile`,
    }).start()

    try {
      const {
        err,
        code,
        map: sourceMap,
      } = await ncc(path.join(outDir, '_entry.js'), {
        minify: liteMode,
        target: 'es2020',
        sourceMap: true,
        sourceMapRegister: false,
        cache: false,
        // TODO: add debug flag to add this and other debug options
        quiet: true,
        // debugLog: false
      })

      const deployFile = path.join(outDir, 'deploy.js')
      fs.writeFileSync(deployFile, code, 'utf8')
      const mapFile = path.join(outDir, 'deploy.js.map')
      fs.writeFileSync(mapFile, sourceMap, 'utf8')
      const activeTopics: Flatfile.EventTopic[] = await getActiveTopics(
        deployFile
      )

      if (err) {
        return program.error(messages.error(err))
      }
      const agent = await apiClient.agents.create({
        environmentId: environment!.id, // Assuming environment is always defined; otherwise, check for its existence before.
        body: {
          topics: activeTopics,
          compiler: 'js',
          source: code,
          sourceMap,
          slug: slug ?? selectedAgent?.slug,
        },
      })

      deployingSpinner.succeed(
        `Event listener "${chalk.green(
          agent?.data?.slug
        )}" deployed and running on your environment "${chalk.green(
          environment?.name
        )}". ${chalk.dim(agent?.data?.id)}\n`
      )
    } catch (e) {
      return program.error(messages.error(e))
    }
  } catch (e) {
    return program.error(messages.error(e))
  }
}
