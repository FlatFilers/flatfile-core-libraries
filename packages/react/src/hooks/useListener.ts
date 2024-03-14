import { useEffect } from 'react'
import { useFlatfile } from './useFlatfile'
import FlatfileListener from '@flatfile/listener'

export function useListener(
  cb: FlatfileListener | ((cb: FlatfileListener) => void),
  dependencies: any[] = []
) {
  const { listener } = useFlatfile()
  useEffect(() => {
    if (!listener) return

    if (typeof cb === 'function') {
      cb(listener)
    } else {
      // Assume cb is a listener instance
      listener.use(() => cb)
    }
    // Call the callback with the listener to set up event handling

    return () => {
      // Assuming 'detach' removes all event listeners from this instance
      listener.detach()
    }
  }, [...dependencies]) // React will re-run the effect if any dependencies change
}
