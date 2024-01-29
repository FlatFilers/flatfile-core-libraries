import chalk from 'chalk'
import ora from 'ora'

import { config } from '../../config'
import { authAction } from './auth.action'

import { program } from 'commander'
import { messages } from '../../shared/messages'

export async function createEnvironmentAction(
  options: Partial<{
    endpoint: string
    name: string
    isProd?: boolean
  }>
) {
  const apiUrl =
    options.endpoint || config().endpoint || process.env.FLATFILE_API_URL

  if (!apiUrl) {
    return program.error(messages.noApiUrl)
  }

  const clientId = config().clientId
  if (!clientId) {
    return program.error(messages.flatfilercConfig('clientId'))
  }

  const secret = config().secret

  if (!secret) {
    return program.error(messages.flatfilercConfig('secret'))
  }

  const name = options.name

  if (!name) {
    return program.error(messages.noEnvironmentName)
  }

  try {
    // Create and authenticated API client
    const apiClient = await authAction({ apiUrl, clientId, secret })

    if (!apiClient) {
      return program.error(
        messages.failedToCreateEnvironment(name, `API client failure`)
      )
    }

    // Find or Create Environment
    const envSpinner = ora({
      text: `Create Environment`,
    }).start()
    try {
      const newEnvironmentCreated = await apiClient.createEnvironment({
        environmentConfig: {
          name,
          isProd: options.isProd ?? false,
        },
      })
      const environmentId = newEnvironmentCreated?.data?.id ?? ''
      envSpinner.succeed(`Environment created:  ${chalk.dim(environmentId)}`)
    } catch (e) {
      return program.error(messages.failedToCreateEnvironment(name, e))
    }
  } catch (e) {
    return program.error(messages.error(e))
  }
}
