import React, { ReactNode, useEffect, useState } from 'react'

import FlatfileContext from './FlatfileContext'
import { initializeSpace } from '../utils/initializeSpace'
import FlatfileListener, { Browser } from '@flatfile/listener'
import { getSpace } from '../utils/getSpace'

interface FlatfileProviderProps {
  children: ReactNode
  pubKey?: string
  environmentId: string
  apiUrl?: string
  space?: {
    id: string
    accessToken: string
  }
}

export const FlatfileProvider: React.FC<FlatfileProviderProps> = ({
  children,
  pubKey,
  environmentId,
  space,
  apiUrl = 'https://platform.flatfile.com/api',
}) => {
  const [sessionSpace, setSessionSpace] = useState<any>(null)
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    if (!!pubKey) {
      createSpace()
    } else if (space?.id && space?.accessToken) {
      reUseSpace()
    }
  }, [pubKey, space])

  useEffect(() => {
    console.log('useFlatfileContext useEffect', { open })
  }, [open])

  // TODO: need to account for re-using a space too
  const createSpace = async () => {
    if (pubKey) {
      const createdSpace = await initializeSpace({
        publishableKey: pubKey,
        environmentId: environmentId,
        apiUrl,
      })
      ;(window as any).CROSSENV_FLATFILE_API_KEY =
        createdSpace?.data.accessToken
      setSessionSpace(createdSpace)
    }
  }

  const reUseSpace = async () => {
    if (space) {
      const reUsedSpace = await getSpace({
        space,
        environmentId: environmentId,
        apiUrl,
      })
      setSessionSpace(reUsedSpace)
    }
  }

  const [listener, setListener] = useState(new FlatfileListener())

  // TODO: is this useful?
  // Function to update the listener with new event handling logic
  // const updateListener = (updateFn: (cb: FlatfileListener) => void) => {
  //   setListener((currentListener) => {
  //     const clonedListener = currentListener.fork() // Fork the current listener

  //     clonedListener.mount(
  //       new Browser({
  //         apiUrl,
  //         accessToken: space?.data.accessToken,
  //         fetchApi: fetch,
  //       })
  //     )

  //     clonedListener.use(updateFn) // Apply the updates
  //     // updateFn(clonedListener) // Apply the updates
  //     return clonedListener // Replace the current listener with the updated one
  //   })
  // }

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
    console.log('FlatfileProvider useEffect', { space })
    if (listener && sessionSpace?.data.accessToken) {
      console.log({ apiUrl, accessToken: sessionSpace?.data.accessToken })
      listener.mount(
        new Browser({
          apiUrl,
          accessToken: sessionSpace?.data.accessToken,
          fetchApi: fetch,
        })
      )
    }
  }, [sessionSpace?.data])

  return (
    <FlatfileContext.Provider
      value={{
        ...(pubKey ? { pubKey } : {}),
        ...(space ? { space } : {}),
        environmentId,
        open,
        setOpen,
        sessionSpace,
        setSessionSpace,
        setListener,
        listener,
      }}
    >
      {children}
    </FlatfileContext.Provider>
  )
}
