import React, { JSX, useEffect, useState } from 'react'
import DefaultError from '../../components/Error'
import Space from '../../components/legacy/Space'
import Spinner from '../../components/Spinner'
import { State } from '@flatfile/embedded-utils'
import { initializeSpace } from '../../utils/initializeSpace'
import { getSpace } from '../../utils/getSpace'
import { IReactSpaceProps } from '../../types'

export const useSpace = (props: IReactSpaceProps): JSX.Element | null => {
  const {
    error: ErrorElement,
    errorTitle,
    loading: LoadingElement,
    apiUrl,
  } = props
  const [initError, setInitError] = useState<Error | string>()
  const [state, setState] = useState<State>({
    localSpaceId: '',
    accessTokenLocal: '',
    spaceUrl: '',
  })
  const [closeInstance, setCloseInstance] = useState<boolean>(false)

  const { localSpaceId, spaceUrl, accessTokenLocal } = state

  const initSpace = async () => {
    setCloseInstance(false)
    try {
      const { data } = props.publishableKey
        ? await initializeSpace(props)
        : await getSpace(props)
      if (!data) {
        throw new Error('Failed to initialize space')
      }

      const { id: spaceId, accessToken, guestLink } = data

      if (!spaceId) {
        throw new Error('Missing spaceId from space response')
      }

      if (!guestLink) {
        throw new Error('Missing guest link from space response')
      }

      setState((prevState) => ({
        ...prevState,
        localSpaceId: spaceId,
        spaceUrl: guestLink,
      }))

      if (!accessToken) {
        throw new Error('Missing access token from space response')
      }

      setState((prevState) => ({
        ...prevState,
        accessTokenLocal: accessToken,
      }))
    } catch (error: any) {
      setInitError(error)
    }
  }

  useEffect(() => {
    initSpace()
  }, [])

  const errorElement = ErrorElement ? (
    // Adding non-null assertion because this will never be hit if error is falsy, ts is unhappy.
    ErrorElement(initError!)
  ) : (
    <DefaultError error={errorTitle || initError!} />
  )

  const loadingElement = LoadingElement ?? (
    <div style={{ margin: '16px' }}>
      <Spinner />
    </div>
  )

  if (initError) {
    return errorElement
  }

  if (closeInstance) {
    return null
  }

  if (localSpaceId && spaceUrl && accessTokenLocal) {
    return (
      <Space
        key={localSpaceId}
        spaceId={localSpaceId}
        spaceUrl={spaceUrl}
        accessToken={accessTokenLocal}
        handleCloseInstance={() => setCloseInstance(true)}
        {...props}
      />
    )
  }

  return loadingElement
}

export default useSpace
