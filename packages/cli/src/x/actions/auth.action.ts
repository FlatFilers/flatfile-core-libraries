import { FlatfileClient } from '@flatfile/api'
import { program } from 'commander'
import ora from 'ora'
import { config } from '../../config'
import { docUrls, messages } from '../../shared/messages'

export function apiKeyClient({
  apiUrl,
  apiKey,
}: {
  apiUrl: string
  apiKey: string
}): FlatfileClient {
  return new FlatfileClient({
    environment: `${apiUrl ?? 'https://platform.flatfile.com/api'}/v1`,
    token: apiKey,
  })
}

export async function authAction({
  apiUrl,
  clientId,
  secret,
}: {
  apiUrl: string
  clientId: string
  secret: string
}) {
  const authSpinner = ora({
    text: `Creating authenticated client`,
  }).start()
  const auth = config().auth
  const DEFAULT_API_URL = apiUrl ?? `${docUrls.api}/v1`

  if (auth) {
    authSpinner.text = `Creating access token`

    try {
      const authClient = new FlatfileClient({
        environment: DEFAULT_API_URL,
      })

      let authResponse
      try {
        authResponse = await authClient.auth.createAccessToken({
          type: 'apiCredentials',
          clientId,
          secret,
        })
      } catch (e) {
        authSpinner.stop()
        return program.error(messages.error(`Failed to create access token`))
      }

      if (!authResponse?.accessToken) {
        return program.error(
          messages.error(`Response did not contain access token`)
        )
      }
      const { accessToken } = authResponse
      const apiClient = new FlatfileClient({
        environment: DEFAULT_API_URL,
        token: accessToken,
      })
      authSpinner.succeed(`Access token created`)
      return apiClient
    } catch (e) {
      return program.error(messages.error(e))
    }
  } else {
    try {
      const dotdotdot = '...'
      const apiClient = new FlatfileClient({
        environment: DEFAULT_API_URL,
        token: dotdotdot,
      })
      authSpinner.succeed(`Client created without auth enabled`)
      return apiClient
    } catch (e) {
      return program.error(messages.error(e))
    }
  }
}
