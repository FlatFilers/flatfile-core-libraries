import React, { JSX, useState } from 'react'
import DefaultError from '../components/Error'
import Space from '../components/Space'
import Spinner from '../components/Spinner'
import { SpinnerStyles } from '../components/embeddedStyles'
import { ISpace, State, initializePubnub } from '@flatfile/embedded-utils'
import { initializeSpace } from '../utils/initializeSpace'
import { getSpace } from '../utils/getSpace'

type IUseSpace = { createOrUseSpace: () => Promise<void>; Space: () => JSX.Element; }

export const useSpaceTrigger = (props: ISpace): IUseSpace => {
  const {
    error: ErrorElement,
    errorTitle,
    loading: LoadingElement,
    apiUrl,
  } = props
  const [initError, setInitError] = useState<Error | string>()
  const [state, setState] = useState<State>({
    pubNub: null,
    localSpaceId: '',
    accessTokenLocal: '',
    spaceUrl: '',
  })

  const { localSpaceId, pubNub, spaceUrl, accessTokenLocal } = state

  const initSpace = async () => {
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

      const initializedPubNub = await initializePubnub({
        spaceId,
        accessToken,
        apiUrl,
      })

      setState((prevState) => ({
        ...prevState,
        pubNub: initializedPubNub,
      }))
    } catch (error: any) {
      setInitError(error)
    }
  }

  const errorElement = ErrorElement ? (
    // Adding non-null assertion because this will never be hit if error is falsy, ts is unhappy.
    ErrorElement(initError!)
  ) : (
    <DefaultError error={errorTitle || initError!} />
  )

  const loadingElement = LoadingElement ?? (
    <SpinnerStyles>
      <Spinner />
    </SpinnerStyles>
  )

  return {
    createOrUseSpace: initSpace,
    Space: () => pubNub ? initError ? errorElement : <Space
      key={localSpaceId}
      spaceId={localSpaceId}
      spaceUrl={spaceUrl}
      accessToken={accessTokenLocal}
      pubNub={pubNub}
      {...props}
    /> : loadingElement
  }
}

export default useSpaceTrigger