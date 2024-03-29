import React, { useState, useContext, useRef, useEffect, JSX } from 'react'
import { IFrameTypes } from '../types'
import ConfirmModal from './ConfirmCloseModal'
import FlatfileContext from './FlatfileContext'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'
import { CloseButton } from './CloseButton'

export const EmbeddedIFrameWrapper = (
  props: Partial<IFrameTypes> & {
    handleCloseInstance: () => void
  }
): JSX.Element => {
  const { open, sessionSpace } = useContext(FlatfileContext)
  const iRef = useRef<HTMLIFrameElement | null>(null)

  const [showExitWarnModal, setShowExitWarnModal] = useState(false)

  const {
    closeSpace,
    iframeStyles,
    mountElement = 'flatfile_iFrameContainer',
    exitText = 'Are you sure you want to exit? Any unsaved changes will be lost.',
    exitTitle = 'Close Window',
    exitPrimaryButtonText = 'Yes, exit',
    exitSecondaryButtonText = 'No, stay',
    displayAsModal = true,
    handleCloseInstance,
    preload = true,
    spaceUrl,
  } = props
  const spacesUrl = spaceUrl || 'https://platform.flatfile.com/s'
  const preloadUrl = `${spacesUrl}/space-init`

  useEffect(() => {
    if (sessionSpace && iRef.current) {
      const targetOrigin = new URL(spacesUrl).origin

      iRef.current.contentWindow?.postMessage(
        {
          flatfileEvent: {
            topic: 'portal:initialize',
            payload: {
              status: 'complete',
              spaceUrl: `${targetOrigin}/space/${
                sessionSpace.space.id
              }?token=${encodeURIComponent(sessionSpace.space.accessToken)}`,
              initialResources: sessionSpace,
            },
          },
        },
        targetOrigin
      )
    }
  }, [sessionSpace])

  const spaceLink = sessionSpace?.space?.guestLink || null

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
      {(open || preload) && (
        <iframe
          data-testid={mountElement}
          className={mountElement}
          style={{
            ...getIframeStyles(iframeStyles!),
            ...(preload
              ? { display: open ? 'block' : 'none' }
              : { display: 'block' }),
          }}
          src={preload ? preloadUrl : spaceLink}
          ref={iRef}
        />
      )}
      <CloseButton handler={() => setShowExitWarnModal(true)} />
    </div>
  )
}
