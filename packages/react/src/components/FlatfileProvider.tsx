import React, { ReactNode, useContext, useEffect, useState } from 'react'

import FlatfileContext from './FlatfileContext'
import { initializeSpace } from '../utils/initializeSpace'

interface FlatfileProviderProps {
  children: ReactNode
  pubKey: string
  environmentId: string
}

export const FlatfileProvider: React.FC<FlatfileProviderProps> = ({
  children,
  pubKey,
  environmentId,
}) => {
  // const providerValue = {
  //   pubKey,
  //   environmentId,
  // }
  const { space, open, setOpen, setSpace } = useFlatfileContext()

  return (
    <FlatfileContext.Provider
      value={{ pubKey, environmentId, open, setOpen, space, setSpace }}
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

  useEffect(() => {
    console.log('useFlatfileContext useEffect', { open })
  }, [open])

  const getSpace = async () => {
    const space = await initializeSpace({
      publishableKey: pubKey,
      environmentId: environmentId,
    })
    console.log('getSpace')
    setSpace(space)
    // setSpace(space)
  }

  return { space, open, setOpen, setSpace }
}
