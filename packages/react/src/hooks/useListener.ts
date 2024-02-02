import { useEffect } from 'react'
import { useFlatfile } from './useFlatfile'
import FlatfileListener, { Browser } from '@flatfile/listener'

export function useListener(
  cb: (cb: FlatfileListener) => void,
  dependencies: any[] = []
) {
  const { listener } = useFlatfile()
  useEffect(() => {
    if (!listener) return

    // Call the callback with the listener to set up event handling
    cb(listener)

    return () => {
      // Assuming 'detach' removes all event listeners from this instance
      listener.detach()
    }
  }, [...dependencies]) // React will re-run the effect if any dependencies change
}
