import { useContext, useEffect } from 'react'
import FlatfileListener from '@flatfile/listener'
import { FlatfileContext } from '../components'

export function usePlugin(
  plugin?: (cb: FlatfileListener) => void,
  dependencies: any[] = []
) {
  const { listener, accessToken } = useContext(FlatfileContext)
  useEffect(() => {
    if (!listener) return

    if (plugin) {
      listener.use(plugin)
    }
    return () => {
      listener.detach()
    }
  }, [listener, accessToken, plugin, ...dependencies])
}
