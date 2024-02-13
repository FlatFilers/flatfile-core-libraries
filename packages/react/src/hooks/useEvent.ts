import { EventCallback, FlatfileEvent } from '@flatfile/listener'
import { useFlatfile } from './useFlatfile'
import { useEffect } from 'react'

// Overload definitions for better type checking
function useEvent(
  eventType: string,
  callback: (event: FlatfileEvent) => void | Promise<void>,
  dependencies?: any[]
): void
function useEvent(
  eventType: string,
  filter: Record<string, any>,
  callback: (event: FlatfileEvent) => void | Promise<void>,
  dependencies?: any[]
): void
function useEvent(
  eventType: string,
  filterOrCallback:
    | Record<string, any>
    | ((event: any) => void | Promise<void>),
  callbackOrDependencies:
    | ((event: FlatfileEvent) => void | Promise<void>)
    | any[] = [],
  dependencies: any[] = []
) {
  const { listener } = useFlatfile()

  let callback: (event: any) => void | Promise<void>
  let actualDependencies: any[] = dependencies

  // Determine if the second argument is a filter or a callback
  if (typeof filterOrCallback === 'function') {
    callback = filterOrCallback as EventCallback
    actualDependencies = (callbackOrDependencies as any[]) || []
  } else {
    callback = callbackOrDependencies as (event: any) => void | Promise<void>
  }

  useEffect(() => {
    if (!listener) return

    // Conditionally apply the filter
    if (typeof filterOrCallback !== 'function') {
      listener.on(eventType, filterOrCallback, callback)
    } else {
      listener.on(eventType, callback)
    }

    // Cleanup
    return () => {
      if (typeof filterOrCallback !== 'function') {
        listener.off(eventType, filterOrCallback, callback)
      } else {
        listener.off(eventType, callback)
      }
    }
  }, [listener, eventType, filterOrCallback, callback, ...actualDependencies])
}

export { useEvent }
