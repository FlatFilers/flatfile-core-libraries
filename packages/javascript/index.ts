import api, { FlatfileClient } from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import * as RecordHookPlugin from '@flatfile/plugin-record-hook'
import { createIframe } from './src/createIframe'
import { startFlatfile } from './src/startFlatfile'

export {
  api,
  createIframe,
  FlatfileListener,
  RecordHookPlugin,
  startFlatfile,
  FlatfileClient,
}
export const initializeFlatfile = startFlatfile
