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

  'workbook:created',
  'workbook:updated',
  'workbook:deleted',
  'workbook:expired',

  'sheet:created',
  'sheet:updated',
  'sheet:deleted',

  'snapshot:created',

  'records:created',
  'records:updated',
  'records:deleted',

  'file:created',
  'file:updated',
  'file:deleted',
  'file:expired',

  'job:created',
  'job:updated',
  'job:deleted',
  'job:failed',
  'job:completed',
  'job:ready',
  'job:scheduled',
  'job:outcome-acknowledged',
  'job:parts-completed',

  'program:created',
  'program:updated',

  'commit:created',
  'commit:updated',
  'commit:completed',
  'layer:created',

  'secret:created',
  'secret:updated',
  'secret:deleted',
] as Flatfile.EventTopic[]

export const AUTODETECT_FILE_PATHS = [
  path.posix.join(process.cwd(), 'index.js'),
  path.posix.join(process.cwd(), 'index.ts'),
  path.posix.join(process.cwd(), 'src', 'index.js'),
  path.posix.join(process.cwd(), 'src', 'index.ts'),
  path.posix.join(process.cwd(), '.build', 'index.js'),
  path.posix.join(process.cwd(), 'dist', 'index.js'),
]

export const tableConfig = {
  border: {
    topBody: `─`,
    topJoin: `┬`,
    topLeft: `┌`,
    topRight: `┐`,

    bottomBody: `─`,
    bottomJoin: `┴`,
    bottomLeft: `└`,
    bottomRight: `┘`,

    bodyLeft: `│`,
    bodyRight: `│`,
    bodyJoin: `│`,

    joinBody: `─`,
    joinLeft: `├`,
    joinRight: `┤`,
    joinJoin: `┼`
  }
}