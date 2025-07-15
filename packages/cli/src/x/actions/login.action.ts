import { program } from 'commander'
import ora from 'ora'
import type { Region } from '../types/oauth.types'
import { REGION_URLS } from '../types/oauth.types'
import { OAuthClient } from '../utils/oauth.client'
import { storeCredentials, parseJWT } from '../utils/credentials'

export async function loginAction(options: { region?: string }) {
  const validRegions = Object.keys(REGION_URLS)
  
  if (options.region && !validRegions.includes(options.region)) {
    program.error(`Invalid region: ${options.region}. Valid options: ${validRegions.join(', ')}`)
  }
  
  const region: Region = (options.region as Region) || 'us'
  const baseUrl = REGION_URLS[region]
  
  console.log(`Initiating device authorization for ${region} region...`)
  
  const oauthClient = new OAuthClient(region)
  const spinner = ora('Requesting device authorization...').start()

  try {
    // Step 1: Request device authorization
    const deviceAuth = await oauthClient.requestDeviceAuthorization()
    spinner.succeed('Device authorization requested')

    // Step 2: Display instructions to user
    const verificationUrl = oauthClient.getVerificationUrl(deviceAuth.verification_uri)
    console.log('\nPlease complete the following steps:')
    console.log(`1. Visit: ${verificationUrl}`)
    console.log(`2. Enter code: ${deviceAuth.user_code}`)
    console.log('')

    // Step 3: Poll for authorization with spinner
    const expiresInMinutes = Math.floor(deviceAuth.expires_in / 60)
    const pollSpinner = ora(`Waiting for authorization... (expires in ${expiresInMinutes}m)`).start()

    // Update spinner text with remaining time
    const startTime = Date.now()
    const updateInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = deviceAuth.expires_in - elapsed
      if (remaining > 0) {
        const remainingMinutes = Math.floor(remaining / 60)
        const remainingSeconds = remaining % 60
        pollSpinner.text = `Waiting for authorization... (expires in ${remainingMinutes}m ${remainingSeconds}s)`
      }
    }, 1000)

    try {
      const tokenResponse = await oauthClient.pollForAuthorization(
        deviceAuth.device_code,
        deviceAuth.interval,
        deviceAuth.expires_in
      )

      clearInterval(updateInterval)
      pollSpinner.succeed('Authorization successful!')

      // Step 4: Store credentials
      const jwt = parseJWT(tokenResponse.access_token)
      const expiresAt = jwt.exp ? jwt.exp * 1000 : undefined

      await storeCredentials({
        access_token: tokenResponse.access_token,
        region,
        base_url: baseUrl,
        expires_at: expiresAt
      })

      console.log(`✓ You are now logged in to Flatfile (${region}).`)

    } catch (error: any) {
      clearInterval(updateInterval)
      pollSpinner.fail('Authorization failed')
      
      // Don't re-throw, handle the error here directly
      if (error.message.includes('expired')) {
        program.error('Device code expired. Please run the command again.')
      } else if (error.message.includes('already been used')) {
        program.error('Device code has already been used. Please run the command again.')
      } else if (error.message.includes('Invalid client')) {
        program.error('Configuration error. Please check your client configuration.')
      } else if (error.message.includes('network')) {
        program.error('Network connection issues. Please check your connection and try again.')
      } else {
        program.error(`Login failed: ${error.message}`)
      }
      return // Exit without throwing
    }

  } catch (error: any) {
    spinner.fail('Login failed')
    program.error(`Failed to initiate login: ${error.message}`)
  }
}
