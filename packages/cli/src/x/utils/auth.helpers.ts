import { FlatfileClient } from '@flatfile/api'
import { program } from 'commander'
import { loadCredentials } from './credentials'

/**
 * Gets an authenticated Flatfile client using stored credentials
 * If no valid credentials are found, exits with an error message
 */
export async function getAuthenticatedClient(): Promise<FlatfileClient> {
  const credentials = await loadCredentials()
  
  if (!credentials) {
    program.error('Not authenticated. Run `flatfile login` to authenticate.')
  }

  return new FlatfileClient({
    environment: `${credentials.base_url}/api/v1`,
    token: credentials.access_token,
  })
}

/**
 * Gets the current region from stored credentials
 */
export async function getCurrentRegion(): Promise<string | null> {
  const credentials = await loadCredentials()
  return credentials?.region || null
}

/**
 * Gets the stored access token
 */
export async function getStoredToken(): Promise<string | null> {
  const credentials = await loadCredentials()
  return credentials?.access_token || null
}
