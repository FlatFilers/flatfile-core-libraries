import { config } from '../config'
import { en_us } from './localized/en-us'

export enum docUrls {
  api = 'https://platform.flatfile.com/api',
  authentication = 'https://flatfile.com/docs/developer-tools/security/authentication',
  sharedEnvironments = 'https://flatfile.com/docs/developer-tools/developing/running-local#shared-environments',
  environments = 'https://flatfile.com/docs/developer-tools/environment',
}

export function localizedMessages(local: string | undefined = config().local) {
  return localized[local as keyof typeof localized]
}

const localized = {
  en_us,
}

export const messages = localizedMessages()
