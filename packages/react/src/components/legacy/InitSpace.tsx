import { InitState } from '@flatfile/embedded-utils'
import React, { JSX, useEffect, useState } from 'react'
import { useCreateListener } from '../../hooks/legacy/useCreateListener'
import { IReactInitSpaceProps } from '../../types'
import { addSpaceInfo } from '../../utils/addSpaceInfo'
import { authenticate } from '../../utils/authenticate'
import { getSpace } from '../../utils/getSpace'
import { initializeSpace } from '../../utils/initializeSpace'
import ConfirmModal from '../ConfirmCloseModal'
import DefaultError from './Error'
import { getContainerStyles, getIframeStyles } from '../embeddedStyles'
import '../style.scss'

/**
 * @deprecated - use FlatfileProvider and Space components instead
 * @name InitSpace
 * @description Flatfile Embedded Space component which pre-loads an iFrame, improving the load time of the embedded sheet when opened by a user
 * @param props
 */

const defaultSpaceUrl = 'https://platform.flatfile.com/s/space-init'
const initialState = {
  localSpaceId: null,
  accessTokenLocal: null,
}

export const InitSpace = (props: IReactInitSpaceProps): JSX.Element => {
  const {
    spaceUrl = defaultSpaceUrl,
    activated,
    listener,
    closeSpace,
    iframeStyles,
    error: ErrorElement,
    errorTitle,
    mountElement = 'flatfile_initIFrameContainer',
    exitText = 'Are you sure you want to exit? Any unsaved changes will be lost.',
    exitTitle = 'Close Window',
    exitPrimaryButtonText = 'Yes, exit',
    exitSecondaryButtonText = 'No, stay',
    apiUrl = 'https://platform.flatfile.com/api',
    displayAsModal = true,
  } = props
  const [unmountIFrame, setUnmountIFrame] = useState(false)
  const [initError, setInitError] = useState<Error | string>()
  const [showExitWarnModal, setShowExitWarnModal] = useState(false)
  const [state, setState] = useState<InitState>(initialState)
  const containerStyles = {
    ...getContainerStyles(displayAsModal),
    display: activated ? 'flex' : 'none',
  }
  const { dispatchEvent } = useCreateListener({
    listener,
    accessToken: state.accessTokenLocal,
    apiUrl,
  })
  const iFrameEl = document.getElementsByClassName(
    mountElement
  )[0] as HTMLIFrameElement

  const initSpace = async () => {
    try {
      // If space has been initialized already but not "completed" (i.e. custom opens modal, closes, then re-opens)
      // this logic ensures that same space is re-used, rather than spawning a new one
      if (state.localSpaceId && state.accessTokenLocal) {
        return
      }

      const isReusingSpace = props.space && props.space.id

      const { data } = isReusingSpace
        ? await getSpace(props)
        : await initializeSpace(props)

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

      if (!accessToken) {
        throw new Error('Missing access token from space response')
      }

      if (!isReusingSpace && props.publishableKey) {
        const fullAccessApi = authenticate(accessToken, apiUrl)
        await addSpaceInfo(props, data.id, fullAccessApi)
      }

      if (iFrameEl) {
        const targetOrigin = new URL(spaceUrl).origin
        iFrameEl.contentWindow?.postMessage(
          {
            flatfileEvent: {
              topic: 'portal:initialize',
              payload: {
                status: 'complete',
                spaceUrl: guestLink,
              },
            },
          },
          targetOrigin
        )
      }

      setState((prevState) => ({
        ...prevState,
        localSpaceId: spaceId,
        accessTokenLocal: accessToken,
      }))
    } catch (error: any) {
      setInitError(error)
    }
  }

  useEffect(() => {
    if (activated) {
      initSpace()
    }
  }, [activated])

  useEffect(() => {
    const handlePostMessage = (event: any) => {
      const { flatfileEvent } = event.data
      if (!flatfileEvent) return
      if (
        flatfileEvent.topic === 'job:outcome-acknowledged' &&
        flatfileEvent.payload.status === 'complete' &&
        flatfileEvent.payload.operation === closeSpace?.operation
      ) {
        setState({ ...initialState })
        setUnmountIFrame(true)
        closeSpace?.onClose({})
      }
      dispatchEvent(flatfileEvent)
    }

    window.addEventListener('message', handlePostMessage, false)
    return () => {
      window.removeEventListener('message', handlePostMessage)
    }
  }, [dispatchEvent])

  useEffect(() => {
    if (unmountIFrame) {
      setUnmountIFrame(!unmountIFrame)
    }
  }, [unmountIFrame])

  const handleCloseModal = () => {
    setInitError(undefined)
    setState({ ...initialState })
    setUnmountIFrame(true)
    setShowExitWarnModal(false)
    closeSpace?.onClose({})
  }

  const errorElement = initError ? (
    ErrorElement && initError ? (
      ErrorElement(initError)
    ) : (
      <DefaultError error={errorTitle || initError} />
    )
  ) : null

  return (
    <div
      className={`flatfile_initIframe-wrapper ${
        displayAsModal ? 'flatfile_displayAsModal' : ''
      }`}
      style={containerStyles}
      data-testid="space-contents"
    >
      {showExitWarnModal && (
        <ConfirmModal
          onConfirm={handleCloseModal}
          onCancel={() => setShowExitWarnModal(false)}
          exitText={exitText}
          exitTitle={exitTitle}
          exitPrimaryButtonText={exitPrimaryButtonText}
          exitSecondaryButtonText={exitSecondaryButtonText}
        />
      )}
      {!initError && !unmountIFrame && (
        <>
          <iframe
            data-testid={mountElement}
            className={mountElement}
            style={getIframeStyles(iframeStyles!)}
            src={spaceUrl}
          />
          <button
            onClick={() => setShowExitWarnModal(true)}
            data-testid="flatfile-close-button"
            type="button"
            className="flatfile-close-button"
            style={{ position: 'absolute', margin: '30px' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 100 100"
            >
              <line
                x1="10"
                y1="10"
                x2="90"
                y2="90"
                stroke="white"
                strokeWidth="10"
              />
              <line
                x1="10"
                y1="90"
                x2="90"
                y2="10"
                stroke="white"
                strokeWidth="10"
              />
            </svg>
          </button>
        </>
      )}
      {initError && errorElement}
    </div>
  )
}

export default InitSpace
