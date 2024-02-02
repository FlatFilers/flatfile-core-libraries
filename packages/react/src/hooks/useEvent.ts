import FlatfileListener from '@flatfile/listener'
import { useFlatfile } from './useFlatfile'
import { useEffect } from 'react'

export function useEvent(
  eventType: string,
  callback: (event: any) => void | Promise<void>,
  filter?: Record<string, any>, // Added filter parameter
  dependencies: any[] = []
) {
  const { listener } = useFlatfile()

  useEffect(() => {
    if (listener) {
      // Check if a filter is provided and use it when registering the event
      if (filter) {
        listener.on(eventType, filter, callback)
      } else {
        listener.on(eventType, callback)
      }

      // Return a cleanup function that detaches the listener with the same filter, if provided
      return () => {
        if (filter) {
          listener.off(eventType, filter, callback)
        } else {
          listener.off(eventType, callback)
        }
      }
    }
  }, [listener, eventType, callback, filter, ...dependencies]) // Ensure filter is included in dependencies
}
