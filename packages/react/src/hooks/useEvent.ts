import FlatfileListener from '@flatfile/listener'
import { useFlatfile } from './useFlatfile'
import { useEffect } from 'react'

export function useEvent(
  eventType: string,
  callback: (event: any) => void | Promise<void>,
  dependencies: any[] = []
) {
  const { listener } = useFlatfile()

  useEffect(() => {
    if (listener) {
      listener.on(eventType, callback)

      // Return a cleanup function that detaches the listener
      return () => {
        listener.off(eventType, callback)
      }
    }
  }, [...dependencies])
}
