export interface DeviceAuthResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface OAuthError {
  error: string
  error_description: string
}

export type Region = 'us' | 'stg' | 'uk' | 'eu' | 'au' | 'ca' | 'local'

export const REGION_URLS: Record<Region, string> = {
  us: 'https://platform.flatfile.com/api',
  stg: 'https://platform.flatfile.run/api',
  uk: 'https://platform.uk.flatfile.com/api',
  eu: 'https://platform.eu.flatfile.com/api',
  au: 'https://platform.au.flatfile.com/api',
  ca: 'https://platform.ca.flatfile.com/api',
  local: 'http://localhost:3000'
}

export const CLIENT_ID = 'dashboard'
