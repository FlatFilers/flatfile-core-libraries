import axios from 'axios'
import type { DeviceAuthResponse, TokenResponse, OAuthError, Region } from '../types/oauth.types'
import { CLIENT_ID, REGION_URLS } from '../types/oauth.types'
import { debug } from './debug'

export class OAuthClient {
  private baseUrl: string
  private oauthBaseUrl: string
  private clientId: string

  constructor(region: Region = 'us') {
    this.baseUrl = REGION_URLS[region]
    // For OAuth endpoints, strip /api prefix for non-local environments
    this.oauthBaseUrl = region === 'local' 
      ? this.baseUrl 
      : this.baseUrl.replace('/api', '')
    this.clientId = CLIENT_ID
  }

  async requestDeviceAuthorization(): Promise<DeviceAuthResponse> {
    const url = `${this.oauthBaseUrl}/oauth/device/authorize`
    const payload = { client_id: this.clientId }
    
    debug('Device authorization request', { url, payload })
    
    try {
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      })

      debug('Device authorization response', response.data)
      return response.data
    } catch (error: any) {
      debug('Device authorization error', { 
        status: error.response?.status, 
        data: error.response?.data,
        message: error.message 
      })
      
      const errorData: OAuthError = error.response?.data || { error: 'network_error', error_description: 'Network error during device authorization' }
      throw new Error(`Device authorization failed: ${errorData.error_description}`)
    }
  }

  async pollForAuthorization(deviceCode: string, interval: number, expiresIn: number): Promise<TokenResponse> {
    const startTime = Date.now()
    const expiresAt = startTime + (expiresIn * 1000)
    let retryDelay = interval * 1000
    let consecutiveNetworkErrors = 0

    while (Date.now() < expiresAt) {
      const tokenUrl = `${this.oauthBaseUrl}/oauth/token`
      const tokenPayload = {
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        client_id: this.clientId,
        device_code: deviceCode
      }
      
      debug('Token request', { url: tokenUrl, payload: tokenPayload })
      
      try {
        const response = await axios.post(tokenUrl, tokenPayload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout
        })

        debug('Token response', { status: response.status, data: response.data })

        if (response.status === 200) {
          return response.data
        }
      } catch (error: any) {
        debug('Token request error', { 
          status: error.response?.status, 
          data: error.response?.data,
          message: error.message 
        })
        
        // Reset network error count on any response (even error responses)
        if (error.response) {
          consecutiveNetworkErrors = 0
          const errorData: OAuthError = error.response.data

          if (errorData?.error === 'authorization_pending') {
            // Continue polling - this is the normal case
            debug('Authorization pending, continuing to poll...')
            await this.sleep(retryDelay)
            continue
          } else if (errorData?.error === 'expired_token') {
            throw new Error('Device code has expired. Please try again.')
          } else if (errorData?.error === 'invalid_grant') {
            throw new Error('Device code has already been used. Please try again.')
          } else if (errorData?.error === 'invalid_client') {
            throw new Error('Invalid client configuration.')
          } else if (errorData?.error) {
            // Other OAuth errors
            throw new Error(`Authorization failed: ${errorData.error_description || errorData.error}`)
          } else {
            // Non-OAuth compliant response - this indicates a backend issue
            throw new Error(`Backend returned non-OAuth compliant response: ${error.response.status} - ${JSON.stringify(errorData)}`)
          }
        } else {
          // Network error (no response received)
          consecutiveNetworkErrors++
          
          if (consecutiveNetworkErrors >= 5) {
            throw new Error('Too many network errors. Please check your connection and try again.')
          }
          
          // Use exponential backoff for network errors
          const networkRetryDelay = Math.min(1000 * Math.pow(2, consecutiveNetworkErrors - 1), 30000)
          await this.sleep(networkRetryDelay)
          continue
        }
      }
    }

    throw new Error('Device authorization expired. Please try again.')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getVerificationUrl(verificationUri: string): string {
    return `${this.oauthBaseUrl}${verificationUri}`
  }
}
