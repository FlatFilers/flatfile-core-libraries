import React, { ReactNode, useEffect, useState } from 'react'

import FlatfileContext from './FlatfileContext'
import FlatfileListener, { Browser } from '@flatfile/listener'
import { Flatfile } from '@flatfile/api'

type Exclusive<T, U> =
  | (T & Partial<Record<Exclude<keyof U, keyof T>, never>>)
  | (U & Partial<Record<Exclude<keyof T, keyof U>, never>>)

interface BaseSpace {
  children: ReactNode
  environmentId?: string
  apiUrl?: string
  options?: object
}

interface CreateSpaceWithPublishableKey extends BaseSpace {
  publishableKey: string
  space?: Partial<Flatfile.SpaceConfig>
}

interface ReusedSpace extends BaseSpace {
  space: Partial<Flatfile.SpaceConfig> & { id: string; accessToken: string }
}

// Use the Exclusive type for your props
type ExclusiveFlatfileProviderProps = Exclusive<
  CreateSpaceWithPublishableKey,
  ReusedSpace
>

export const FlatfileProvider: React.FC<ExclusiveFlatfileProviderProps> = ({
  children,
  publishableKey,
  environmentId,
  space,
  apiUrl = 'https://platform.flatfile.com/api',
  options = {},
}) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined)
  const [listener, setListener] = useState(new FlatfileListener())
  const [open, setOpen] = useState<boolean>(false)
  const [sessionSpace, setSessionSpace] = useState<any>(null)
  const [flatfileConfiguration, setFlatfileConfiguration] =
    useState<any>(options)
  const [spaceConfig, setSpaceConfig] = useState<any>(null)

  const handlePostMessage = (event: any) => {
    const { flatfileEvent } = event.data
    if (!flatfileEvent) return

    listener.dispatchEvent(flatfileEvent)
  }

  useEffect(() => {
    window.addEventListener('message', handlePostMessage, false)
    return () => {
      window.removeEventListener('message', handlePostMessage)
    }
  }, [listener])

  useEffect(() => {
    if (listener && accessToken) {
      listener.mount(
        new Browser({
          apiUrl,
          accessToken,
          fetchApi: fetch,
        })
      )
    }
  }, [listener, accessToken, apiUrl])

  return (
    <FlatfileContext.Provider
      value={{
        ...(publishableKey ? { publishableKey } : {}),
        ...(space ? { space } : {}),
        apiUrl,
        environmentId,
        open,
        setOpen,
        sessionSpace,
        setSessionSpace,
        setListener,
        listener,
        accessToken,
        setAccessToken,
        flatfileConfiguration,
        setFlatfileConfiguration,
      }}
    >
      {children}
    </FlatfileContext.Provider>
  )
}
