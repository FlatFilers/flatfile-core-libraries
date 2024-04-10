import { useContext, useEffect } from 'react'
import FlatfileListener from '@flatfile/listener'
import { FlatfileContext } from '../components'

export function usePlugin(
  plugin: (cb: FlatfileListener) => void,
  dependencies: any[] = []
) {
  const { listener } = useContext(FlatfileContext)
  useEffect(() => {
    if (!listener) return

    listener.use(plugin)
    return () => {
      listener.detach()
    }
  }, [listener, plugin, ...dependencies])
}
