import React, { JSX, useContext, useEffect, useState } from 'react'
import { IFrameTypes } from '../types'
import { useIsIFrameLoaded } from '../utils/useIsIFrameLoaded'
import { CloseButton } from './CloseButton'
import { ConfirmCloseModal } from './ConfirmCloseModal'
import FlatfileContext from './FlatfileContext'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'

export const EmbeddedIFrameWrapper = (
  props: Partial<IFrameTypes> & {
    handleCloseInstance: () => void
  }
): JSX.Element => {
  const { open, sessionSpace, ready, iframe } = useContext(FlatfileContext)

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
  const spacesUrl = spaceUrl ?? 'https://platform.flatfile.com/s'
  const preloadUrl = `${spacesUrl}/space-init`
  const isIFrameLoaded = useIsIFrameLoaded(iframe)

  useEffect(() => {
    if (sessionSpace && iframe.current) {
      const targetOrigin = new URL(spacesUrl).origin
      if (sessionSpace.space?.id && sessionSpace.space?.accessToken) {
        iframe.current.contentWindow?.postMessage(
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
    }
  }, [sessionSpace, iframe.current, isIFrameLoaded])

  const spaceLink = sessionSpace?.space?.guestLink || null
  const openVisible = (open: boolean): React.CSSProperties => ({
    opacity: ready && open ? 1 : 0,
    pointerEvents: ready && open ? 'all' : 'none',
  })

  const iframeSrc = preload ? preloadUrl : spaceLink

  return (
    <div
      className={`flatfile_iframe-wrapper ${
        displayAsModal ? 'flatfile_displayAsModal' : ''
      }`}
      style={{
        ...getContainerStyles(displayAsModal),
        ...openVisible(open),
      }}
      data-testid="space-contents"
    >
      {showExitWarnModal && (
        <ConfirmCloseModal
          onConfirm={() => {
            handleCloseInstance()
            setShowExitWarnModal(false)
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
        ref={iframe}
        src={iframeSrc}
        title="Embedded Portal Content"
        style={{
          ...getIframeStyles(iframeStyles!),
          ...(preload ? openVisible(open) : { opacity: 1 }),
        }}
      />
      <CloseButton handler={() => setShowExitWarnModal(true)} />
    </div>
  )
}
