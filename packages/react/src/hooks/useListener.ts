import { useEffect } from 'react'
import { useCreateListener } from './useCreateListener'
import { useFlatfile } from './useFlatfile'
import FlatfileListener from '@flatfile/listener'

// pseudo implementation of actually being able to use listeners in react
export function useListener(cb: FlatfileListener, observables?: any[]) {
  // TODO: get accessToken from context
  // const { accessToken } = useFlatfile()
  
  const accessToken = ''
  const listener = useCreateListener({
    accessToken,
    listener: cb,
  })
  useEffect(() => {
    const fork = listener.fork() // need to somehow get a new listener instance so we can detach and retach on resubscribe
    fork.use(cb)
    return () => {
      fork.detach() // this doesn't exist yet, need to make sure it no longer receives events
    }
  }, observables)
}
