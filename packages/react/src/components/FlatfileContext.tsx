import FlatfileListener from '@flatfile/listener'
import { createContext } from 'react'

export interface FlatfileContextType {
  publishableKey?: string
  environmentId: string
  open: boolean
  setOpen: (open: boolean) => void
  space?: { id: string; accessToken: string }
  sessionSpace?: any
  setSessionSpace: (space: any) => void
  listener: FlatfileListener
  setListener: (space: any) => void
}

const FlatfileContext = createContext<FlatfileContextType>({
  publishableKey: undefined,
  environmentId: '',
  open: true,
  setOpen: () => {},
  space: undefined,
  sessionSpace: undefined,
  setSessionSpace: () => {},
  listener: new FlatfileListener(),
  setListener: () => {},
})

export default FlatfileContext
