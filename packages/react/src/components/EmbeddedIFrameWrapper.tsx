import React, {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
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
    displayAsModal = true,
    exitPrimaryButtonText = 'Yes, exit',
    exitSecondaryButtonText = 'No, stay',
    exitText = 'Are you sure you want to exit? Any unsaved changes will be lost.',
    exitTitle = 'Close Window',
    handleCloseInstance,
    iframeStyles,
    mountElement = 'flatfile_iFrameContainer',
    preload = true,
    spaceUrl,
  } = props
  const spacesUrl = spaceUrl ?? 'https://platform.flatfile.com/s'
  const preloadUrl = `${spacesUrl}/space-init`
  const isIFrameLoaded = useIsIFrameLoaded(iframe)

  const retryTimeoutsRef = useRef<Set<number>>(new Set())
  const acknowledgedMessagesRef = useRef<Set<string>>(new Set())

  const sendInitializeMessage = useCallback(
    (retryCount = 0, messageId?: string) => {
      if (
        !sessionSpace?.space?.id ||
        !sessionSpace?.space?.accessToken ||
        !iframe.current
      ) {
        return
      }

      const targetOrigin = new URL(spacesUrl).origin

      // Generate messageId only on first attempt
      if (!messageId) {
        messageId = `init_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 11)}`
      }

      // Don't send if already acknowledged
      if (acknowledgedMessagesRef.current.has(messageId)) {
        return
      }

      console.debug(
        `Sending portal:initialize message (attempt ${
          retryCount + 1
        }), messageId: ${messageId}`
      )

      iframe.current.contentWindow?.postMessage(
        {
          flatfileEvent: {
            topic: 'portal:initialize',
            payload: {
              status: 'complete',
              messageId,
              spaceUrl: `${targetOrigin}/space/${
                sessionSpace.space.id
              }?token=${encodeURIComponent(sessionSpace.space.accessToken)}`,
              initialResources: sessionSpace,
            },
          },
        },
        targetOrigin
      )

      // Set up retry logic (max 5 retries with exponential backoff)
      if (retryCount < 5) {
        const retryDelay = Math.min(500 * Math.pow(2, retryCount), 8000) // Cap at 8 seconds
        const timeoutId = setTimeout(() => {
          retryTimeoutsRef.current.delete(timeoutId as unknown as number)
          if (!acknowledgedMessagesRef.current.has(messageId!)) {
            console.debug(
              `No acknowledgment received for messageId ${messageId}, retrying...`
            )
            sendInitializeMessage(retryCount + 1, messageId)
          }
        }, retryDelay) as unknown as number

        retryTimeoutsRef.current.add(timeoutId)
      } else {
        console.warn(
          `Failed to receive acknowledgment after ${
            retryCount + 1
          } attempts for messageId: ${messageId}`
        )
      }
    },
    [sessionSpace, iframe, spacesUrl]
  )

  // Listen for acknowledgment messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { flatfileEvent } = event.data
      if (
        flatfileEvent?.topic === 'portal:initialize:ack' &&
        flatfileEvent?.payload?.status === 'acknowledged'
      ) {
        const messageId = flatfileEvent.payload.originalMessageId
        if (messageId) {
          console.debug(`Received acknowledgment for messageId: ${messageId}`)
          acknowledgedMessagesRef.current.add(messageId)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Send initial message
  useEffect(() => {
    if (sessionSpace && iframe.current && isIFrameLoaded) {
      sendInitializeMessage()
    }
  }, [sessionSpace, iframe.current, isIFrameLoaded, sendInitializeMessage])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
      retryTimeoutsRef.current.clear()
    }
  }, [])

  const spaceLink = sessionSpace?.space?.guestLink || null
  const openVisible = (open: boolean): React.CSSProperties => ({
    opacity: ready && open ? 1 : 0,
    pointerEvents: ready && open ? 'all' : 'none',
    visibility: open ? 'visible' : 'hidden',
    left: ready && open ? '0' : '-200vw',
    top: ready && open ? '0' : '-200vh',
  })
  const iframeSrc = preload ? preloadUrl : spaceLink
  const modalRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (modalRef.current) {
      const containerStyles = getContainerStyles(displayAsModal)
      Object.assign(modalRef.current.style, {
        ...containerStyles,
        ...openVisible(open),
        width: ready && open ? containerStyles.width : '0',
        height: ready && open ? containerStyles.height : '0',
      })
    }
  }, [open, ready, modalRef.current])

  return (
    <div
      className={`flatfile_iframe-wrapper ${
        displayAsModal ? 'flatfile_displayAsModal' : ''
      }`}
      ref={modalRef}
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
        allow="clipboard-read; clipboard-write; sync-xhr 'self' '*.flatfile.com'"
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
