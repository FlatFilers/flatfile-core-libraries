import { useContext, useEffect } from 'react'
import FlatfileListener from '@flatfile/listener'
import { FlatfileContext } from '../components'

export function usePlugin(
  plugin: (cb: FlatfileListener) => void,
  dependencies: any[] = []
) {
  const { listener } = useContext(FlatfileContext)
  // const {listener} = useFlatfile()
  useEffect(() => {
    if (!listener) return
    // Call the callback with the listener to set up event handling
    listener.use(plugin)
    return () => {
      // Assuming 'detach' removes all event listeners from this instance
      listener.detach()
    }
  }, [listener, ...dependencies]) // React will re-run the effect if any dependencies change
}
