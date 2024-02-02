import React, { ReactNode, useContext, useEffect, useState } from 'react'

import FlatfileContext from './FlatfileContext'
import { initializeSpace } from '../utils/initializeSpace'
import FlatfileListener, { Browser } from '@flatfile/listener'

interface FlatfileProviderProps {
  children: ReactNode
  pubKey: string
  environmentId: string
  apiUrl?: string
}

export const FlatfileProvider: React.FC<FlatfileProviderProps> = ({
  children,
  pubKey,
  environmentId,
  apiUrl = 'https://platform.flatfile.com/api',
}) => {

  const [space, setSpace] = useState<any>(null)
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    if (!!pubKey) {
      getSpace()
    }
  }, [pubKey])

  useEffect(() => {
    console.log('useFlatfileContext useEffect', { open })
  }, [open])

  const getSpace = async () => {
    const space = await initializeSpace({
      publishableKey: pubKey,
      environmentId: environmentId,
      apiUrl,
    })
    ;(window as any).CROSSENV_FLATFILE_API_KEY = space?.data.accessToken
    setSpace(space)
  }

  const [listener, setListener] = useState(new FlatfileListener())

  // Function to update the listener with new event handling logic
  const updateListener = (updateFn: (cb: FlatfileListener) => void) => {
    setListener((currentListener) => {
      const clonedListener = currentListener.fork() // Fork the current listener

      clonedListener.mount(
        new Browser({
          apiUrl,
          accessToken: space?.data.accessToken,
          fetchApi: fetch,
        })
      )

      clonedListener.use(updateFn) // Apply the updates
      // updateFn(clonedListener) // Apply the updates
      return clonedListener // Replace the current listener with the updated one
    })
  }

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
    if (listener && space?.data.accessToken) {
      console.log({ apiUrl, accessToken: space?.data.accessToken })
      listener.mount(
        new Browser({
          apiUrl,
          accessToken: space?.data.accessToken,
          fetchApi: fetch,
        })
      )
    }
  }, [space?.data])

  return (
    <FlatfileContext.Provider
      value={{
        pubKey,
        environmentId,
        open,
        setOpen,
        space,
        setSpace,
        updateListener,
        listener,
      }}
    >
      {children}
    </FlatfileContext.Provider>
  )
}

export const useFlatfileContext = () => {
  const [space, setSpace] = useState<any>(null)
  const [open, setOpen] = useState<boolean>(false)

  const { pubKey, environmentId } = useContext(FlatfileContext)

  useEffect(() => {
    if (!!pubKey) {
      getSpace()
    }
  }, [pubKey])

  // useEffect(() => {
  //   console.log('useFlatfileContext useEffect', { open })
  // }, [open])

  const getSpace = async () => {
    const space = await initializeSpace({
      publishableKey: pubKey,
      environmentId: environmentId,
    })
    // TODO: setting for use with the @flatfile/api package
    ;(window as any).CROSSENV_FLATFILE_API_KEY = space?.data.accessToken
    setSpace(space)
    // setSpace(space)
  }

  return { space, open, setOpen, setSpace }
}
