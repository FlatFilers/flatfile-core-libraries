import FlatfileListener from '@flatfile/listener'
import { createContext } from 'react'

export interface FlatfileContextType {
  pubKey: string
  environmentId: string
  open: boolean
  setOpen: (open: boolean) => void
  space?: any
  setSpace: (space: any) => void
  updateListener: (updateFn: (cb: FlatfileListener) => void) => void,
  listener: FlatfileListener
}

const FlatfileContext = createContext<FlatfileContextType>({
  pubKey: '',
  environmentId: '',
  open: true,
  setOpen: () => {},
  space: undefined,
  setSpace: () => {},
  updateListener: (updateFn: (cb: FlatfileListener) => void) => {},
  listener: new FlatfileListener(),
})

export default FlatfileContext
