import api, { FlatfileClient } from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import * as RecordHookPlugin from '@flatfile/plugin-record-hook'
import { createIframe } from './src/createIframe'
import { startFlatfile } from './src/startFlatfile'
import { initNewSpace } from './src/initNewSpace'

export {
  api,
  createIframe,
  FlatfileListener,
  RecordHookPlugin,
  startFlatfile,
  FlatfileClient,
  initNewSpace,
}

export * from './src/types'
export * from './src/listener'
export const initializeFlatfile = startFlatfile
