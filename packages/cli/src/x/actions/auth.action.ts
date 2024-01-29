import { Configuration, DefaultApi } from '@flatfile/api'
import chalk from 'chalk'
import { program } from 'commander'
import fetch from 'node-fetch'
import ora from 'ora'
import { config } from '../../config'
import { docUrls, messages } from '../../shared/messages'

export function apiKeyClient({
  apiUrl,
  apiKey,
}: {
  apiUrl: string
  apiKey: string
}): DefaultApi {
  return new DefaultApi(
    new Configuration({
      fetchApi: fetch,
      basePath: `${apiUrl ?? 'https://platform.flatfile.com/api'}/v1`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
  )
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
  const ClientConfig = (accessToken: string) => {
    return new Configuration({
      basePath: DEFAULT_API_URL,
      fetchApi: fetch,
      accessToken,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }
  if (auth) {
    authSpinner.text = `Creating access token`

    try {
      const authClient = new DefaultApi(
        new Configuration({
          fetchApi: fetch,
          basePath: DEFAULT_API_URL,
        })
      )
      let authResponse
      try {
        authResponse = await authClient.getAccessToken({
          apiCredentials: {
            clientId,
            secret,
          },
        })
      } catch (e) {
        authSpinner.stop()
        return program.error(messages.error(`Failed to create access token`))
      }

      if (!authResponse?.data?.accessToken) {
        return program.error(
          messages.error(`Response did not contain access token`)
        )
      }
      const { accessToken } = authResponse.data
      const apiClient = new DefaultApi(ClientConfig(String(accessToken)))
      authSpinner.succeed(`Access token created`)
      return apiClient
    } catch (e) {
      return program.error(messages.error(e))
    }
  } else {
    try {
      const dotdotdot = '...'
      const apiClient = new DefaultApi(ClientConfig(dotdotdot))
      authSpinner.succeed(`Client created without auth enabled`)
      return apiClient
    } catch (e) {
      return program.error(messages.error(e))
    }
  }
}
