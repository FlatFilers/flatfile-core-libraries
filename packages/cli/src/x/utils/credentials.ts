import { promises as fs } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { Region } from '../types/oauth.types'

export interface StoredCredentials {
  access_token: string
  region: Region
  base_url: string
  expires_at?: number
}

const CONFIG_DIR = join(homedir(), '.config', 'flatfile')
const CREDENTIALS_FILE = join(CONFIG_DIR, 'credentials.json')

export async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true })
  } catch (error) {
    // Directory already exists or other error
  }
}

export async function storeCredentials(credentials: StoredCredentials): Promise<void> {
  await ensureConfigDir()
  await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2))
}

export async function loadCredentials(): Promise<StoredCredentials | null> {
  try {
    const data = await fs.readFile(CREDENTIALS_FILE, 'utf-8')
    const credentials: StoredCredentials = JSON.parse(data)
    
    // Check if token is expired (if expires_at is available)
    if (credentials.expires_at && Date.now() > credentials.expires_at) {
      return null
    }
    
    return credentials
  } catch (error) {
    return null
  }
}

export async function clearCredentials(): Promise<void> {
  try {
    await fs.unlink(CREDENTIALS_FILE)
  } catch (error) {
    // File doesn't exist or other error
  }
}

export function parseJWT(token: string): { 
  exp?: number 
  email?: string
  sub?: string
  name?: string
  [key: string]: any
} {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())
    return decoded
  } catch (error) {
    return {}
  }
}
