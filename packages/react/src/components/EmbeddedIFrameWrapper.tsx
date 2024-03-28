import React, { useState, useContext } from 'react'
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

  if (!sessionSpace?.guestLink) {
    throw new Error('No guest link found')
  }

  const [showExitWarnModal, setShowExitWarnModal] = useState(false)

  const { guestLink: spaceUrl } = sessionSpace

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
  } = props

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
      {open && (
        <iframe
          data-testid={mountElement}
          className={mountElement}
          style={getIframeStyles(iframeStyles!)}
          src={spaceUrl}
        />
      )}
      <CloseButton handler={() => setShowExitWarnModal(true)} />
    </div>
  )
}
