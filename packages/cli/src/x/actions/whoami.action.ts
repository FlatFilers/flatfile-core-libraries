import { program } from 'commander'
import ora from 'ora'
import { loadCredentials, parseJWT } from '../utils/credentials'

export async function whoamiAction() {
  const spinner = ora('Checking authentication...').start()

  try {
    const credentials = await loadCredentials()

    if (!credentials) {
      spinner.fail('Not authenticated')
      console.log(
        'You are not logged in. Run `flatfile login` to authenticate.'
      )
      return
    }

    // Parse JWT to get user info
    const jwt = parseJWT(credentials.access_token)
    const expiresAt = jwt.exp ? new Date(jwt.exp * 1000) : null

    spinner.text = 'Fetching user information...'

    try {
      // Determine the correct OAuth me endpoint based on region
      const meEndpoint = `${credentials.base_url}/oauth/me`

      const response = await fetch(meEndpoint, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const user: any = await response.json()

      spinner.succeed('Authentication verified')

      console.log(
        `\nLogged in as: ${
          user.data?.user?.email || jwt.email || 'Unknown user'
        }`
      )
      console.log(`Region: ${credentials.region}`)
      console.log(`Base URL: ${credentials.base_url}`)

      if (expiresAt) {
        console.log(`Token expires: ${expiresAt.toLocaleString()}`)
      }
    } catch (error: any) {
      spinner.fail('Authentication failed')

      if (error.message?.includes('401')) {
        console.log(
          'Your session has expired. Run `flatfile login` to re-authenticate.'
        )
      } else {
        program.error(`Failed to verify authentication: ${error.message}`)
      }
    }
  } catch (error: any) {
    spinner.fail('Failed to check authentication')
    program.error(`Failed to check authentication: ${error.message}`)
  }
}
