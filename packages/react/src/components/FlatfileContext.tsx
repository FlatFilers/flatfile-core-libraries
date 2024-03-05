import FlatfileListener from '@flatfile/listener'
import { createContext } from 'react'

export interface FlatfileContextType {
  publishableKey?: string
  environmentId?: string
  apiUrl: string
  open: boolean
  setOpen: (open: boolean) => void
  space?: { id: string; accessToken: string }
  sessionSpace?: any
  setSessionSpace: (space: any) => void
  listener: FlatfileListener
  setListener: (space: any) => void
  accessToken?: string
  setAccessToken: (accessToken: string) => void
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
})

export default FlatfileContext
