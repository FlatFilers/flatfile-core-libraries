import { Flatfile } from '@flatfile/api'
import path from 'path'

export const brandHex = '#4C48EF'
export const developerLink = 'https://dashboard.flatfile.com/user/h/development'
export const loginLink = 'https://dashboard.flatfile.com/account/login'
export const accessKeyLink =
  'https://app.flatfile.com/h/a/env/test/account/access-keys'

export const deployTopics = [
  'agent:created',
  'agent:updated',
  'agent:deleted',

  'space:created',
  'space:updated',
  'space:deleted',
  'space:archived',
  'space:expired',
  'space:guestAdded',
  'space:guestRemoved',

  'document:created',
  'document:updated',
  'document:deleted',

  // 'workbook:added', // legacy
  'workbook:created',
  'workbook:updated',
  'workbook:deleted',
  'workbook:expired',

  // 'sheet:validated', // legacy
  'sheet:created',
  'sheet:updated',
  'sheet:deleted',

  'snapshot:created',

  'records:created',
  'records:updated',
  'records:deleted',

  // 'upload:completed', // legacy
  'file:created',
  'file:updated',
  'file:deleted',

  // 'job:started', // legacy
  'job:created',
  // 'job:waiting', // legacy
  'job:updated',
  'job:deleted',
  'job:failed',
  'job:completed',
  'job:ready',
  'job:scheduled',
  'job:outcome-acknowledged',
  'job:parts-completed',

  'commit:created',
  'commit:updated',
  'commit:completed',
  'layer:created',

  'secret:created',
  'secret:updated',
  'secret:deleted',

  // 'client:init', // legacy
  // 'action:triggered', // legacy
] as Flatfile.EventTopic[]

export const AUTODETECT_FILE_PATHS = [
  path.join(process.cwd(), 'index.js'),
  path.join(process.cwd(), 'index.ts'),
  path.join(process.cwd(), 'src', 'index.js'),
  path.join(process.cwd(), 'src', 'index.ts'),
  path.join(process.cwd(), '.build', 'index.js'),
  path.join(process.cwd(), 'dist', 'index.js'),
]
