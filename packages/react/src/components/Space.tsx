import { ISpace, SpaceComponent } from '@flatfile/embedded-utils'
import React, { JSX, useContext, useEffect, useState } from 'react'
import { useCreateListener } from '../hooks/useCreateListener'
import { addSpaceInfo } from '../utils/addSpaceInfo'
import { authenticate } from '../utils/authenticate'
import ConfirmModal from './ConfirmCloseModal'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'
import './style.scss'
import FlatfileContext from './FlatfileContext'

/**
 * @name Space
 * @description Flatfile Embedded Space component
 * @param props
 */

const Space = ({
  spaceId,
  spaceUrl,
  accessToken,
  handleCloseInstance,
  ...props
}: SpaceComponent &
  ISpace & { handleCloseInstance: () => void }): JSX.Element | null => {
  if (spaceId && spaceUrl && accessToken) {
    return (
      <SpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        accessToken={accessToken}
        handleCloseInstance={handleCloseInstance}
        {...props}
      />
    )
  }
  return null
}

export const SpaceContents = (
  props: ISpace & {
    spaceId: string
    spaceUrl: string
    accessToken: string
    handleCloseInstance: () => void
  }
): JSX.Element => {
  const [showExitWarnModal, setShowExitWarnModal] = useState(false)
  const context = useContext(FlatfileContext)
  const { open } = context
  const {
    spaceId,
    spaceUrl,
    listener,
    accessToken,
    closeSpace,
    iframeStyles,
    mountElement = 'flatfile_iFrameContainer',
    exitText = 'Are you sure you want to exit? Any unsaved changes will be lost.',
    exitTitle = 'Close Window',
    exitPrimaryButtonText = 'Yes, exit',
    exitSecondaryButtonText = 'No, stay',
    apiUrl = 'https://platform.flatfile.com/api',
    displayAsModal = true,
    handleCloseInstance,
  } = props
  const { dispatchEvent } = useCreateListener({
    listener,
    accessToken,
    apiUrl,
  })

  const handlePostMessage = (event: any) => {
    const { flatfileEvent } = event.data
    if (!flatfileEvent) return
    if (
      flatfileEvent.topic === 'job:outcome-acknowledged' &&
      flatfileEvent.payload.status === 'complete' &&
      flatfileEvent.payload.operation === closeSpace?.operation
    ) {
      closeSpace?.onClose({})
    }
    dispatchEvent(flatfileEvent)
  }

  useEffect(() => {
    window.addEventListener('message', handlePostMessage, false)
    return () => {
      window.removeEventListener('message', handlePostMessage)
    }
  }, [listener])

  const buildWorkbook = async () => {
    if (props.publishableKey) {
      const fullAccessApi = authenticate(accessToken, apiUrl)
      await addSpaceInfo(props, spaceId, fullAccessApi)
    }
  }

  useEffect(() => {
    buildWorkbook()
  }, [])

  return (
    <div
      className={`flatfile_iframe-wrapper ${
        displayAsModal ? 'flatfile_displayAsModal' : ''
      }`}
      style={{
        ...getContainerStyles(displayAsModal),
        display: open ? 'flex' : 'none',
      }}
      data-testid="space-contents"
    >
      {showExitWarnModal && (
        <ConfirmModal
          onConfirm={() => {
            handleCloseInstance()
            setShowExitWarnModal(false)
            closeSpace?.onClose({})
          }}
          onCancel={() => setShowExitWarnModal(false)}
          exitText={exitText}
          exitTitle={exitTitle}
          exitPrimaryButtonText={exitPrimaryButtonText}
          exitSecondaryButtonText={exitSecondaryButtonText}
        />
      )}
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
        style={{
          position: 'absolute',
          margin: '30px',
          top: '30px',
          right: '30px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 100 100"
          style={{ margin: 'auto' }}
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
    </div>
  )
}

export default Space
