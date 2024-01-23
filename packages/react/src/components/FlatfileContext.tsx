import { createContext } from 'react'

export interface FlatfileContextType {
  pubKey: string
  environmentId: string
  open: boolean
  setOpen: (open: boolean) => void
  space?: any
  setSpace: (space: any) => void
}

const FlatfileContext = createContext<FlatfileContextType>({
  pubKey: '',
  environmentId: '',
  open: true,
  setOpen: () => {},
  space: undefined,
  setSpace: () => {},
})

export default FlatfileContext
