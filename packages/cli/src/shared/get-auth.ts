import { Configuration, DefaultApi } from '@flatfile/api'
import { program } from 'commander'
import fetch from 'node-fetch'
import ora from 'ora'
import prompt from 'prompts'
import { config } from '../config'
import { apiKeyClient } from '../x/actions/auth.action'
import { docUrls, messages } from './messages'

export async function getAuth(options: any): Promise<{
  apiKey: string
  apiUrl: string
  environment: any
}> {
  const apiUrl =
    options?.apiUrl || process.env.FLATFILE_API_URL || config().api_url

  if (!apiUrl) {
    return program.error(messages.noApiUrl)
  }

  let apiKey =
    options?.token ||
    process.env.FLATFILE_API_KEY ||
    process.env.FLATFILE_SECRET_KEY ||
    process.env.FLATFILE_BEARER_TOKEN

  if (!apiKey) {
    const input = await prompt({
      type: 'select',
      name: 'auth_type',
      message: 'Select an authentication mode',
      choices: [
        {
          title: 'API Key',
          value: 'api_key',
          description: 'Easily obtained from your dashboard',
        },
        { title: 'Your Username & Password', value: 'password' },
        {
          title: 'Environment variable',
          description:
            "You'll need to know how to manage your environment variables.",
          value: 'env',
        },
      ],
      initial: 0,
    })
    switch (input.auth_type) {
      case 'api_key':
        const res = await prompt({
          type: 'password',
          name: 'apiKey',
          message: 'Enter your secret api key',
        })
        apiKey = res.apiKey
        break
      case 'password':
        const auth = await prompt([
          {
            type: 'text',
            name: 'email',
            message: 'Email Address',
          },
          {
            type: 'password',
            name: 'password',
            message: 'Password',
          },
        ])
        const api = new DefaultApi(
          new Configuration({
            fetchApi: fetch,
            basePath: `${apiUrl ?? docUrls.api}/v1`,
          })
        )
        try {
          const res = await api.createAccessToken({
            createAccessTokenRequest: {
              email: auth.email,
              password: auth.password,
            },
          })
          apiKey = res.data?.accessToken
        } catch (e) {
          return program.error(messages.invalidCredentials)
        }

        break
      case 'env':
        console.log(messages.setVariablesHelp)
        process.exit(0)
    }
  }
  const environment = await getEnvironment(options, apiUrl, apiKey)
  return { apiKey, apiUrl, environment }
}

async function getEnvironment(options: any, apiUrl: string, apiKey: string) {
  const envSpinner = ora({
    text: `Looking for environments...`,
  }).start()

  let environments
  try {
    const apiClient = apiKeyClient({ apiUrl, apiKey: apiKey! })
    environments = await apiClient.getEnvironments({ pageSize: 100 })
  } catch (e: any) {
    envSpinner.stop()
    if (!e.response) {
      return program.error(messages.apiResponse(e))
    }
    if (e.response?.status === 401) {
      return program.error(messages.noApiKey)
    } else {
      return program.error(
        messages.error(`${e.response.status}:${e.response.statusText}`)
      )
    }
  }

  if (environments.data?.length === 0) {
    return program.error(messages.noEnvironments)
  }

  envSpinner.succeed(
    `${environments.data?.length} environment(s) found for these credentials`
  )
  const providedEnvironmentId =
    options?.env || process.env.FLATFILE_ENVIRONMENT_ID
  let environment
  if (providedEnvironmentId) {
    const foundEnv = environments.data?.filter(
      (e) => e.id === providedEnvironmentId
    )
    if (foundEnv?.length !== 0) {
      environment = foundEnv?.[0]
    }
  } else if (environments.data?.length! > 1) {
    const res = await prompt({
      type: 'select',
      name: 'environment',
      message: 'Select an Environment',
      choices: environments.data?.map((e) => ({
        title: e.name,
        value: e.id,
      })),
    })

    const selectedEnvironment = environments.data?.find(
      (e) => e.id === res.environment
    )

    environment = selectedEnvironment
  } else {
    environment = environments.data?.[0]
  }

  if (!environment) {
    return program.error(messages.noEnvironments)
  }

  return environment
}
