import FlatfileListener, { Browser, FlatfileEvent } from '@flatfile/listener'
import { useEffect } from 'react'
import { IReactSpaceProps } from '../types'
/**
 * @name useCreateListener
 * @description Listener
 * @param { Pick<ISpace, 'accessToken'| 'listener'> }
 */

type FlatfileListenerInstance = {
  dispatchEvent: (event: any) => void
  fork: () => FlatfileListenerInstance
  use: (cb: FlatfileListener) => void
  detach: () => void
  useEvent: (event: any) => void
}

export const useCreateListener = ({
  accessToken,
  listener,
  apiUrl = 'https://platform.flatfile.com/api',
}: Pick<IReactSpaceProps, 'listener'> & {
  accessToken: string | null
  apiUrl?: string
}): FlatfileListenerInstance => {
  // set the api key to fully authenticate into Flatfile api
  // todo: should we use CrossEnvConfig here?
  ;(window as any).CROSSENV_FLATFILE_API_KEY = accessToken

  useEffect(() => {
    if (listener && accessToken)
      listener.mount(
        new Browser({
          apiUrl,
          accessToken,
          fetchApi: fetch,
        })
      )
  }, [listener, accessToken, apiUrl])

  const useEvent = (event: any) => {
    console.log({ event })
  }

  return {
    dispatchEvent: (event: any) => {
      if (!event || !accessToken) return

      const eventPayload = event.src ? event.src : event
      const eventInstance = new FlatfileEvent(eventPayload, accessToken, apiUrl)
      useEvent(event)
      return listener?.dispatchEvent(eventInstance)
    },
    // implement
    fork: (): FlatfileListenerInstance => {
      return useCreateListener({ accessToken, listener, apiUrl })
    },
    use: (cb: FlatfileListener) => {
      listener?.use(() => cb)
    },
    detach: () => {},
    useEvent,
  }
}
