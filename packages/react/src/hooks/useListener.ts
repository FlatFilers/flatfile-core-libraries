import { useContext, useEffect } from 'react'
import FlatfileListener from '@flatfile/listener'
import { FlatfileContext } from '../components'

export function useListener(
  cb: FlatfileListener | ((cb: FlatfileListener) => void),
  dependencies: any[] = []
) {
  const { listener, accessToken } = useContext(FlatfileContext)
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
  }, [listener, accessToken, cb, ...dependencies])
}
