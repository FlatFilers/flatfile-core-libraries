import { Flatfile } from '@flatfile/api'
import FlatfileListener from '@flatfile/listener'
import { createContext, useContext } from 'react'
import { IFrameTypes, ClosePortalOptions } from '../types'

type CreateNewSpace = Partial<Flatfile.SpaceConfig>
type ReUseSpace = Partial<Flatfile.SpaceConfig> & {
  id: string
  accessToken: string
}

export const DEFAULT_CREATE_SPACE = {
  document: undefined,
  workbook: {
    name: 'Embedded Workbook',
    sheets: [],
  },
  space: {
    name: 'Embedded Space',
    labels: ['embedded'],
    namespace: 'portal',
    metadata: {
      sidebarConfig: { showSidebar: false },
    },
  },
}

export interface FlatfileContextType {
  publishableKey?: string
  environmentId?: string
  apiUrl: string
  open: boolean
  setOpen: (open: boolean) => void
  space?: CreateNewSpace | ReUseSpace
  sessionSpace?: any
  setSessionSpace: (space: any) => void
  listener: FlatfileListener
  setListener: (listener: FlatfileListener) => void
  accessToken?: string
  setAccessToken: (accessToken?: string | null) => void
  addSheet: (config: any) => void
  updateSheet: (
    sheetSlug: string,
    sheetUpdates: Partial<Flatfile.SheetConfig>
  ) => void
  updateWorkbook: (config: any) => void
  updateDocument: (config: any) => void
  createSpace: any
  setCreateSpace: (config: any) => void
  updateSpace: (config: any) => void
  defaultPage: undefined
  setDefaultPage: (object: any) => void
  resetSpace: (options?: ClosePortalOptions) => void
  config?: IFrameTypes
  ready: boolean
}

export const FlatfileContext = createContext<FlatfileContextType>({
  publishableKey: undefined,
  environmentId: undefined,
  apiUrl: '',
  open: true,
  setOpen: () => {},
  space: undefined,
  sessionSpace: undefined,
  setSessionSpace: () => {},
  listener: new FlatfileListener(),
  setListener: () => {},
  accessToken: undefined,
  setAccessToken: () => {},
  addSheet: () => {},
  updateSheet: () => {},
  updateWorkbook: () => {},
  updateDocument: () => {},
  createSpace: undefined,
  setCreateSpace: () => {},
  updateSpace: () => {},
  defaultPage: undefined,
  setDefaultPage: () => {},
  resetSpace: () => {},
  config: undefined,
  ready: false
})
export const useFlatfileInternal = () => useContext(FlatfileContext)
export default FlatfileContext
