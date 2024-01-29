import React from 'react'
import './style.scss'

const ConfirmModal = ({
  onConfirm,
  onCancel,
  exitText,
  exitTitle,
  exitPrimaryButtonText,
  exitSecondaryButtonText,
}: {
  onConfirm: () => void
  onCancel: () => void
  exitText: string
  exitTitle: string
  exitPrimaryButtonText: string
  exitSecondaryButtonText: string
}) => {
  return (
    <>
      <div
        data-testid="close-confirm-modal"
        className="flatfile_outer-shell"
      >
        <div className="close-confirm-modal-inner">
          <div className="flatfile_inner-shell">
            <div className="flatfile_modal-heading">
              {exitTitle}
            </div>
            <div className="flatfile_modal-text">{exitText}</div>
            <div className="flatfile_button-group">
              <div
                onClick={onCancel}
                className="flatfile_button flatfile_secondary"
              >
                <div>{exitSecondaryButtonText}</div>
              </div>
              <div
                onClick={onConfirm}
                className="flatfile_button flatfile_primary"
              >
                <div>{exitPrimaryButtonText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ConfirmModal
