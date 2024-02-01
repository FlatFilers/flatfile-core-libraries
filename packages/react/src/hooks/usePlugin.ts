import { useEffect } from 'react'

// pseudo implementation of actually being able to use listeners in react
function usePlugin(plugin: FlatfileListener, observables?: any[]) {
  const accessToken = ''
  const listener = useCreateListener({
    accessToken,
    listener: cb,
  })

  useEffect(() => {
    const fork = listener.fork() // need to somehow get a new listener instance so we can detach and retach on resubscribe
    fork.use(plugin)
    return () => {
      fork.detach() // this doesn't exist yet, need to make sure it no longer receives events
    }
  }, observables)
}
