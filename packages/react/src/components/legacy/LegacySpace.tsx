import { Flatfile } from '@flatfile/api'
import { ISpace, SpaceComponent } from '@flatfile/embedded-utils'
import React, { JSX, useEffect, useState } from 'react'
import { useCreateListener } from '../../hooks/legacy/useCreateListener'
import { addSpaceInfo } from '../../utils/addSpaceInfo'
import { authenticate } from '../../utils/authenticate'
import ConfirmModal from '../ConfirmCloseModal'
import { getContainerStyles, getIframeStyles } from '../embeddedStyles'
import '../style.scss'

/**
 * @deprecated - use FlatfileProvider and Space components instead. Previously known as Space.
 * @name LegacySpace
 * @description Flatfile Embedded Space component
 * @param props
 */

const LegacySpace = ({
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

  const { dispatchEvent } = useCreateListener({ listener, accessToken, apiUrl })

  const handlePostMessage = (event: any) => {
    const { flatfileEvent } = event.data
    if (!flatfileEvent) return
    if (
      flatfileEvent.topic === 'job:outcome-acknowledged' &&
      flatfileEvent.payload.status === 'complete' &&
      flatfileEvent.payload.operation === closeSpace?.operation &&
      closeSpace &&
      typeof closeSpace.onClose === 'function'
    ) {
      closeSpace.onClose({ event: flatfileEvent })
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
      style={getContainerStyles(displayAsModal)}
      data-testid="space-contents"
    >
      {showExitWarnModal && (
        <ConfirmModal
          onConfirm={() => {
            handleCloseInstance()
            if (closeSpace && typeof closeSpace.onClose === 'function') {
              closeSpace.onClose({})
            }
          }}
          onCancel={() => setShowExitWarnModal(false)}
          exitText={exitText}
          exitTitle={exitTitle}
          exitPrimaryButtonText={exitPrimaryButtonText}
          exitSecondaryButtonText={exitSecondaryButtonText}
        />
      )}
      <iframe
        allow="clipboard-read; clipboard-write"
        className={mountElement}
        data-testid={mountElement}
        src={spaceUrl}
        style={getIframeStyles(iframeStyles!)}
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

export default LegacySpace
