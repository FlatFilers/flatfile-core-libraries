import { Browser, FlatfileEvent } from '@flatfile/listener'
import { useEffect } from 'react'
import { IReactSpaceProps } from '../../types'
/**
 * @name useCreateListener
 * @description Listener
 * @param { Pick<ISpace, 'accessToken'| 'listener'> }
 */

type FlatfileListenerInstance = {
  dispatchEvent: (event: any) => void
}
/**
 * @deprecated - use useListener, useEvent and usePlugin hooks instead
 * This hook is used to create a listener instance
 **/
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

  return {
    dispatchEvent: (event: any) => {
      if (!event || !accessToken) return

      const eventPayload = event.src ? event.src : event
      const eventInstance = new FlatfileEvent(eventPayload, accessToken, apiUrl)
      return listener?.dispatchEvent(eventInstance)
    },
  }
}
