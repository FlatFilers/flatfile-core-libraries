import { Flatfile } from '@flatfile/api'
import { ISpace } from '@flatfile/embedded-utils'
import FlatfileListener from '@flatfile/listener'
import { createContext } from 'react'

type CreateNewSpace = Partial<Flatfile.SpaceConfig>
type ReUseSpace = Partial<Flatfile.SpaceConfig> & {
  id: string
  accessToken: string
}
export interface FlatfileContextType {
  publishableKey?: string
  environmentId?: string
  apiUrl: string
  open: boolean
  setOpen: (open: boolean) => void
  space?: CreateNewSpace | ReUseSpace
  sessionSpace?: Flatfile.Space
  setSessionSpace: (space: Flatfile.Space) => void
  listener: FlatfileListener
  setListener: (listener: FlatfileListener) => void
  accessToken?: string
  setAccessToken: (accessToken: string) => void
  flatfileConfiguration?: any
  setFlatfileConfiguration: (config: any) => void
}

const FlatfileContext = createContext<FlatfileContextType>({
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
  flatfileConfiguration: undefined,
  setFlatfileConfiguration: () => {},
})

export default FlatfileContext
