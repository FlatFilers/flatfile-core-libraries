import { useCallback, useContext, useEffect } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { ClosePortalOptions } from '../types'

interface UseFlatfileOptions {
  onClose?: () => void
}

export const useFlatfile: (useFlatfileOptions?: UseFlatfileOptions) => {
  openPortal: () => void
  closePortal: (options?: ClosePortalOptions) => void
  open: boolean
  setListener: (listener: any) => void
  listener: any
} = (useFlatfileOptions: UseFlatfileOptions = {}) => {
  const context = useContext(FlatfileContext)

  if (!context) {
    throw new Error('useFlatfile must be used within a FlatfileProvider')
  }

  const onCloseCallback = useCallback(
    useFlatfileOptions.onClose ?? (() => {}),
    [typeof useFlatfileOptions.onClose]
  )

  useEffect(() => {
    if (context.onClose !== onCloseCallback) {
      context.setOnClose(() => onCloseCallback)
    }
  }, [context.onClose, context.setOnClose, onCloseCallback])

  const { open, setOpen, setListener, listener, apiUrl, resetSpace, ready } =
    context

  const openPortal = useCallback(() => {
    ;(window as any).CROSSENV_FLATFILE_API_URL = apiUrl
    setOpen(true)
  }, [setOpen, apiUrl])

  const closePortal = useCallback(
    (options?: ClosePortalOptions) => {
      resetSpace(options)
    },
    [resetSpace]
  )

  return {
    openPortal,
    closePortal,
    open,
    setListener,
    listener,
    ready,
  }
}
