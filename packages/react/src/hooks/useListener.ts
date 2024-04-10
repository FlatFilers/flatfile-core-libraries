import { useContext, useEffect } from 'react'
import FlatfileListener from '@flatfile/listener'
import { FlatfileContext } from '../components'

export function useListener(
  cb: FlatfileListener | ((cb: FlatfileListener) => void),
  dependencies: any[] = []
) {
  const { listener } = useContext(FlatfileContext)
  useEffect(() => {
    if (!listener) return

    if (typeof cb === 'function') {
      cb(listener)
    } else {
      listener.use(() => cb)
    }

    return () => {
      listener.detach()
    }
  }, [listener, cb, ...dependencies])
}
