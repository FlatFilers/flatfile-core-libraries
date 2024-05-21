import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  JSX,
  MutableRefObject,
} from 'react'
import { IFrameTypes } from '../types'
import ConfirmModal from './ConfirmCloseModal'
import FlatfileContext from './FlatfileContext'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'
import { CloseButton } from './CloseButton'

export const EmbeddedIFrameWrapper = (
  props: Partial<IFrameTypes> & {
    handleCloseInstance: () => void
    iRef: MutableRefObject<HTMLIFrameElement | null>
  }
): JSX.Element => {
  const { open, sessionSpace } = useContext(FlatfileContext)

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
    iRef,
    preload = true,
    spaceUrl,
  } = props
  const spacesUrl = spaceUrl || 'https://platform.flatfile.com/s'
  const preloadUrl = `${spacesUrl}/space-init`

  useEffect(() => {
    if (sessionSpace && iRef.current) {
      const targetOrigin = new URL(spacesUrl).origin
      if (sessionSpace.space?.id && sessionSpace.space?.accessToken) {
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
    }
  }, [sessionSpace])

  const spaceLink = sessionSpace?.space?.guestLink || null
  const openVisible = (open: boolean): React.CSSProperties => ({
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'all' : 'none',
  })
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
        <ConfirmModal
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
      {(open || preload) && (
        <iframe
          allow="clipboard-read; clipboard-write"
          className={mountElement}
          data-testid={mountElement}
          ref={iRef}
          src={preload ? preloadUrl : spaceLink}
          style={{
            ...getIframeStyles(iframeStyles!),
            ...(preload ? openVisible(open) : { opacity: 1 }),
          }}
        />
      )}
      <CloseButton handler={() => setShowExitWarnModal(true)} />
    </div>
  )
}
