import chalk from 'chalk'
import { program } from 'commander'
import fs from 'fs'
import ora from 'ora'
import path from 'path'
import util from 'util'
import { apiKeyClient } from './auth.action'
// TODO: Can we do better with these types?
// @ts-expect-error
import readJson from 'read-package-json'
const readPackageJson = util.promisify(require('read-package-json'))

// @ts-expect-error
import ncc from '@vercel/ncc'
import { deployTopics } from '../../shared/constants'
import { getAuth } from '../../shared/get-auth'
import { getEntryFile } from '../../shared/get-entry-file'
import { messages } from '../../shared/messages'

export async function deployAction(
  file?: string | null | undefined,
  options?: Partial<{
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

    const deployingSpinner = ora({
      text: `Deploying event listener to Flatfile`,
    }).start()

    try {
      const { err, code } = await ncc(path.join(outDir, '_entry.js'), {
        minify: liteMode,
        target: 'es2020',
        cache: false,
        // TODO: add debug flag to add this and other debug options
        quiet: true,
        // debugLog: false
      })
      if (err) {
        return program.error(messages.error(err))
      }

      const agent = await apiClient.agents.create({
        environmentId: environment?.id!,
        body: {
          topics: deployTopics,
          compiler: 'js',
          source: code,
        },
      })

      deployingSpinner.succeed(
        `Event listener deployed and running on your environment "${
          environment?.name
        }". ${chalk.dim(agent?.data?.id)}\n`
      )
    } catch (e) {
      return program.error(messages.error(e))
    }
  } catch (e) {
    return program.error(messages.error(e))
  }
}
