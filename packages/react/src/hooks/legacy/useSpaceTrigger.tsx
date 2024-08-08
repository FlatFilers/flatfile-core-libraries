import { State } from '@flatfile/embedded-utils'
import React, { JSX, useState } from 'react'
import DefaultError from '../../components/legacy/Error'
import Space from '../../components/legacy/LegacySpace'
import Spinner from '../../components/Spinner'
import { IReactSpaceProps } from '../../types'
import { useAttachStyleSheet } from '../../utils/attachStyleSheet'
import { getSpace } from '../../utils/getSpace'
import { initializeSpace } from '../../utils/initializeSpace'

type IUseSpace = { OpenEmbed: () => Promise<void>; Space: () => JSX.Element }

/**
 * @deprecated - use FlatfileProvider and Space components instead
 * This hook is used to initialize a space and return the Space component
 */

export const initializeFlatfile = (props: IReactSpaceProps): IUseSpace => {
  useAttachStyleSheet()
  const { error: ErrorElement, errorTitle, loading: LoadingElement } = props
  const [initError, setInitError] = useState<Error | string>()
  const [loading, setLoading] = useState<boolean>(false)
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
      setLoading(true)
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
      setLoading(false)
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
    <div style={{ margin: '16px' }}>
      <Spinner />
    </div>
  )

  return {
    OpenEmbed: initSpace,
    Space: () =>
      closeInstance ? null : loading ? (
        loadingElement
      ) : initError ? (
        errorElement
      ) : (
        <Space
          key={localSpaceId}
          spaceId={localSpaceId}
          spaceUrl={spaceUrl}
          accessToken={accessTokenLocal}
          handleCloseInstance={() => setCloseInstance(true)}
          {...props}
        />
      ),
  }
}

export default initializeFlatfile
