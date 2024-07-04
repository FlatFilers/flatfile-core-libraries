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

/**
 * @description 1) returns an selected agent from a list of agents if multiple agents
 * are present in the environment and a slug is not provided, 2) provides information
 * about having multiple agents in the environment, 3) confirms user selection of an
 * agent to deploy to, 4) allows user to select an agent from a list, and 5) returns
 * the selected agent.
 * 
 * @param {Flatfile.Agent[] | undefined} data - array of agents to deploy from, and
 * it allows the function to check if there are multiple agents present in the
 * environment before prompting the user to select one.
 * 
 * @param {string | undefined} slug - input of the selected agent to deploy if only
 * one is available.
 * 
 * @param {ora.Ora} validatingSpinner - ora Ora object that provides a spinner for
 * validating user inputs, showing messages to the user in real-time based on the
 * success or failure of their inputs.
 * 
 * @returns {Flatfile.Agent element} an array of agents selected by the user.
 * 
 * 	* If `data` is defined and has multiple elements, and a slug is already provided,
 * the function returns the agent with the matching slug.
 * 	* If there are multiple agents and no slug is provided, the function prompts the
 * user to select an agent and returns the selected agent.
 * 	* If there is only one agent, the function returns the first element of the `data`
 * array.
 * 
 * 	In summary, the output returned by the `handleAgentSelection` function depends
 * on the input provided and whether a slug is already provided or not.
 */
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

/**
 * @description Iterates through client.listeners and client.nodes, filtering and
 * adding topics to a Set of active topics based on their prefixes. It returns the
 * filtered topics with listeners attached.
 * 
 * @param {ListenerTopics[]} allTopics - list of all available topics to be processed
 * by the function, which is then filtered and transformed based on the client's
 * listeners to generate the active topics with listeners.
 * 
 * @param {any} client - client that will have its listeners searched for active
 * topics, and it is used to recursively call the function on nested clients.
 * 
 * @param {new_expression} topicsWithListeners - Set of active topics after filtering
 * out duplicates and removing cron events explicitly added, and it is updated at
 * each iteration with new topics found in listeners.
 * 
 * @returns {Set} a new `Set` containing the active topics and their listeners.
 * 
 * 	* `topicsWithListeners`: A `Set` containing the active topics that have listeners
 * registered on them.
 * 
 * 	Explanation:
 * 	This set contains the active topics that have listeners registered on them after
 * filtering out cron events and adding them to the set using the `includes()` method.
 * 
 * 	Note: The function does not destructure the output directly, but rather explains
 * its properties for understanding its behavior.
 */
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

/**
 * @description Imports a file, then uses `findActiveTopics` to identify topics that
 * are active based on mount points. Finally, it returns the identified active topics
 * as a promise.
 * 
 * @param {string} file - file to be scanned for active topics.
 * 
 * @returns {Promise<Flatfile.EventTopic[]>} an array of `Flatfile.EventTopic` objects
 * representing the active topics in the provided file.
 */
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

/**
 * @description Generates high-quality documentation for code given to it, by:
 * 
 * * Checking if a directory exists and creating it if needed.
 * * Reading a package.json file and installing any missing dependencies.
 * * Creating an authenticated API client using an API key.
 * * Validating the code package.
 * * Selecting a Flatfile agent based on slug or environment name.
 * * Deploying an event listener to Flatfile using the selected agent.
 * 
 * @param {string | null | undefined} file - entry file containing the Flatfile event
 * listener code, which is read and compiled into a deployable package for Flatfile
 * environments.
 * 
 * @param {Partial<{
 *     slug: string
 *     topics: string
 *     apiUrl: string
 *     token: string
 *   }>} options - Optional partial state of the agent to deploy, which includes the
 * slug, topics, API URL, and token.
 * 
 * @returns {Promise<void>} a successful deployment of an event listener to Flatfile.
 */
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
    const fileContent = fs.readFileSync(file, 'utf8')
    console.log({ file, fileContent })
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
      const { err, code, map } = await ncc(path.join(outDir, '_entry.js'), {
        minify: liteMode,
        target: 'es2020',
        sourceMap: true,
        cache: false,
        // TODO: add debug flag to add this and other debug options
        quiet: true,
        // debugLog: false
      })

      const deployFile = path.join(outDir, 'deploy.js')
      fs.writeFileSync(deployFile, code, 'utf8')
      const mapFile = path.join(outDir, 'deploy.js.map')
      fs.writeFileSync(mapFile, map, 'utf8')
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
          // TODO: Add this to the Agent Table
          // @ts-ignore
          map,
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
