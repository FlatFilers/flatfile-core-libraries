import axios from 'axios'
import { program } from 'commander'
import { promises as fs } from 'fs'
import ora from 'ora'
import prompts from 'prompts'
import { getAuthenticatedClient } from '../utils/auth.helpers'
import { loadCredentials } from '../utils/credentials'

interface Environment {
  id: string
  name: string
  accountId: string
}

interface ApiKey {
  id: string
  type: 'PUBLISHABLE' | 'SECRET'
  rawKey: string
  environmentId: string
}

interface ApiKeysResponse {
  data: ApiKey[]
}

export async function configureAction() {
  const spinner = ora('Loading environments...').start()

  try {
    // Get authenticated client and credentials
    const client = await getAuthenticatedClient()
    const credentials = await loadCredentials()

    if (!credentials) {
      program.error('Not authenticated. Run `flatfile login` to authenticate.')
    }

    // Get environments using @flatfile/api client
    const environmentsResponse = await client.environments.list()
    const environments = environmentsResponse.data

    spinner.succeed('Environments loaded')

    if (!environments || environments.length === 0) {
      console.log('No environments found in your account.')
      return
    }

    // Present environment selection menu
    const { selectedEnvironmentId } = await prompts({
      type: 'select',
      name: 'selectedEnvironmentId',
      message: 'Select an environment to configure:',
      choices: environments.map((env: Environment) => ({
        title: env.name,
        value: env.id,
      })),
    })

    if (!selectedEnvironmentId) {
      console.log('Configuration cancelled.')
      return
    }

    const selectedEnvironment = environments.find(
      (env: Environment) => env.id === selectedEnvironmentId
    )

    // Get API keys for the selected environment
    const keysSpinner = ora('Retrieving API keys...').start()

    try {
      const apiUrl = `${credentials.base_url}/v1/auth/api-keys?environmentId=${selectedEnvironmentId}`
      const keysResponse = await axios.get<ApiKeysResponse>(apiUrl, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const secretKey = keysResponse.data.data.find(
        (key: ApiKey) => key.type === 'SECRET'
      )

      if (!secretKey) {
        keysSpinner.fail('No secret API key found for this environment')
        return
      }

      keysSpinner.succeed('API keys retrieved')

      // Create or update .env file
      const envSpinner = ora('Updating .env file...').start()

      try {
        const envVars = {
          FLATFILE_API_KEY: secretKey.rawKey,
          FLATFILE_API_URL: credentials.base_url,
          FLATFILE_ENVIRONMENT_ID: selectedEnvironmentId,
        }

        await updateEnvFile(envVars)

        envSpinner.succeed('.env file updated')

        console.log(
          `\n✓ Configuration completed for environment: ${selectedEnvironment?.name}`
        )
        console.log(
          '  The following variables have been set in your .env file:'
        )
        console.log(`  - FLATFILE_API_KEY`)
        console.log(`  - FLATFILE_API_URL: ${envVars.FLATFILE_API_URL}`)
        console.log(
          `  - FLATFILE_ENVIRONMENT_ID: ${envVars.FLATFILE_ENVIRONMENT_ID}`
        )
      } catch (error: any) {
        envSpinner.fail('Failed to update .env file')
        program.error(`Error updating .env file: ${error.message}`)
      }
    } catch (error: any) {
      keysSpinner.fail('Failed to retrieve API keys')

      if (error.response?.status === 401) {
        program.error(
          'Authentication failed. Please run `flatfile login` to re-authenticate.'
        )
      } else if (error.response?.status === 403) {
        program.error(
          'Access denied. You may not have permission to access API keys for this environment.'
        )
      } else {
        program.error(`Failed to retrieve API keys: ${error.message}`)
      }
    }
  } catch (error: any) {
    spinner.fail('Failed to load environments')

    if (error.message.includes('Not authenticated')) {
      program.error('Not authenticated. Run `flatfile login` to authenticate.')
    } else {
      program.error(`Error: ${error.message}`)
    }
  }
}

async function updateEnvFile(envVars: Record<string, string>): Promise<void> {
  const envFilePath = '.env'
  let existingContent = ''

  try {
    existingContent = await fs.readFile(envFilePath, 'utf-8')
  } catch (error) {
    // File doesn't exist, that's fine
  }

  const lines = existingContent.split('\n')
  const updatedLines: string[] = []
  const processedVars = new Set<string>()

  // Process existing lines
  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines and comments, but preserve them
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      updatedLines.push(line)
      continue
    }

    // Check if this is a variable assignment
    const equalIndex = line.indexOf('=')
    if (equalIndex > 0) {
      const varName = line.substring(0, equalIndex).trim()

      if (Object.hasOwn(envVars, varName)) {
        // Update existing variable
        updatedLines.push(`${varName}=${envVars[varName]}`)
        processedVars.add(varName)
      } else {
        // Keep existing variable unchanged
        updatedLines.push(line)
      }
    } else {
      // Not a variable assignment, keep as is
      updatedLines.push(line)
    }
  }

  // Add any new variables that weren't in the existing file
  for (const [varName, value] of Object.entries(envVars)) {
    if (!processedVars.has(varName)) {
      updatedLines.push(`${varName}=${value}`)
    }
  }

  // Remove trailing empty lines and ensure file ends with single newline
  while (
    updatedLines.length > 0 &&
    updatedLines[updatedLines.length - 1].trim() === ''
  ) {
    updatedLines.pop()
  }

  const finalContent =
    updatedLines.join('\n') + (updatedLines.length > 0 ? '\n' : '')
  await fs.writeFile(envFilePath, finalContent)
}
