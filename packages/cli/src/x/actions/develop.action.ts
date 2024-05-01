import { Client } from '@flatfile/listener'
import { program } from 'commander'
import { PubSubDriver } from '@flatfile/listener-driver-pubsub'
import fs from 'fs'
// @ts-expect-error
import ncc from '@vercel/ncc'
import ora from 'ora'
import path from 'path'
import prompts from 'prompts'

import { apiKeyClient } from './auth.action'
import { getAuth } from '../../shared/get-auth'
import { getEntryFile } from '../../shared/get-entry-file'
import { messages } from '../../shared/messages'

export async function developAction(
  file?: string | null | undefined,
  options?: Partial<{
    apiUrl: string
    token: string
    env: string
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

  process.env.FLATFILE_BEARER_TOKEN = apiKey
  process.env.FLATFILE_API_KEY = apiKey
  process.env.FLATFILE_SECRET_KEY = apiKey

  file = getEntryFile(file, 'develop')

  if (!file) {
    return program.error(messages.noEntryFile)
  }

  process.env.AGENT_INTERNAL_URL = apiUrl

  try {
    ora({
      text: `Environment "${environment?.name}" selected`,
    }).succeed()

    // Check if any agents are listed for environment
    const apiClient = apiKeyClient({ apiUrl, apiKey: apiKey! })

    const agents = await apiClient.agents.list({
      environmentId: environment.id,
    })
    if (agents?.data && agents?.data?.length > 0) {
      console.error(messages.warnDeployedAgents(agents.data))
  
      const { developLocally } = await prompts({
        type: 'confirm',
        name: 'developLocally',
        message: 'Would you like to proceed listening locally? (y/n)',
      })

      if (!developLocally) {
        ora({
          text: `Local development aborted`,
        }).fail()
        process.exit(1)
      }

    }

    const driver = new PubSubDriver(environment.id)

    const watcher = ncc(file, {
      watch: true,
      // TODO: add debug flag to add this and other debug options
      quiet: true,
      // debugLog: false
    })

    watcher.handler(async ({ err, code }: { err: any; code: any }) => {
      if (err) {
        return program.error(messages.error(err))
      } else {
        try {
          Object.keys(require.cache).forEach(function (id) {
            if (id.includes('develop.js')) {
              delete require.cache[id]
            }
          })
          const listenerPath = path.join(outDir, 'develop.js')
          await fs.promises.writeFile(listenerPath, code)
          const listener = require(listenerPath)
          const devClient = Client.create(listener.default)
          devClient.setVariables({
            accessToken: apiKey,
            apiUrl,
          })

          devClient.mount(driver)
          console.log('\nFile change detected. 🚀')
        } catch (e) {
          return program.error(messages.error(e))
        }
      }
    })

    await driver.start()
  } catch (e) {
    return program.error(messages.error(e))
  }
}
