import { useContext } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { ClosePortalOptions } from '../types'

export const useFlatfile: () => {
  openPortal: () => void
  closePortal: (options?: ClosePortalOptions) => void
  open: boolean
  setListener: (listener: any) => void
  listener: any
} = () => {
  const context = useContext(FlatfileContext)

  if (!context) {
    throw new Error('useFlatfile must be used within a FlatfileProvider')
  }

  const { open, setOpen, setListener, listener, apiUrl, resetSpace, ready } =
    context

  const openPortal = () => {
    ;(window as any).CROSSENV_FLATFILE_API_URL = apiUrl
    setOpen(true)
  }

  const closePortal = (options?: ClosePortalOptions) => {
    resetSpace(options)
  }

  return {
    openPortal,
    closePortal,
    open,
    setListener,
    listener,
    ready,
  }
}
