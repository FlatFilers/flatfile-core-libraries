import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import * as RecordHookPlugin from '@flatfile/plugin-record-hook'
import { createIframe } from './src/createIframe'
import { startFlatfile } from './src/startFlatfile'

export { api, createIframe, FlatfileListener, RecordHookPlugin }

export const initializeFlatfile = startFlatfile
