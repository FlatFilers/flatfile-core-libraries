import React from 'react'
// TODO: make this style import configurable
import './style.scss'

export const ConfirmCloseModal = ({
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
}) => (
  <div data-testid="close-confirm-modal" className="flatfile_outer-shell">
    <div className="flatfile_close-confirm-modal-inner">
      <div className="flatfile_inner-shell">
        <div className="flatfile_modal-heading">{exitTitle}</div>
        <div className="flatfile_modal-text">{exitText}</div>
        <div className="flatfile_button-group">
          <button
            onClick={onCancel}
            className="flatfile_button flatfile_secondary"
          >
            <div>{exitSecondaryButtonText}</div>
          </button>
          <button
            onClick={onConfirm}
            className="flatfile_button flatfile_primary"
          >
            <div>{exitPrimaryButtonText}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
)
