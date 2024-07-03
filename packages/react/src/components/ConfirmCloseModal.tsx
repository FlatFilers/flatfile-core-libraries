import React from 'react'

/**
 * @description Creates a modal component that displays an exit message and provides
 * two buttons: one for canceling and one for confirming the exit. When a button is
 * clicked, the `onClick` event handler is triggered, and the functionality of the
 * button is executed.
 * 
 * @param {() => void} .onConfirm - function to be executed when the user confirms
 * the exit action.
 * 
 * @param {() => void} .onCancel - function to be executed when the cancel button is
 * clicked inside the modal window.
 * 
 * @param {string} .exitText - text to be displayed in the modal's body for confirmation
 * before closing the modal.
 * 
 * @param {string} .exitTitle - title displayed above the modal when it is dismissed,
 * typically providing a concise and informative description of the action being
 * confirmed or cancelled.
 * 
 * @param {string} .exitPrimaryButtonText - text to display on the primary button of
 * the close confirmation modal, which is typically labeled as "OK" or "Save Changes".
 * 
 * @param {string} .exitSecondaryButtonText - text to be displayed inside the secondary
 * button that is located within the close confirm modal.
 * 
 * @returns {HTMLDivElement} a modal component with a heading, text, primary and
 * secondary buttons.
 * 
 * 	* `onConfirm`: A function that will be called when the primary button is clicked.
 * 	* `onCancel`: A function that will be called when the secondary button is clicked
 * or when the user cancels the modal.
 * 	* `exitText`: The text to display in the modal for the exit message.
 * 	* `exitTitle`: The title to display in the modal for the exit message.
 * 	* `exitPrimaryButtonText`: The text to display on the primary button in the modal.
 * 	* `exitSecondaryButtonText`: The text to display on the secondary button in the
 * modal.
 * 
 * 	The returned output is a JSX element with a `div` container that contains the
 * modal layout. The `div` element with the class `flatfile_outer-shell` contains the
 * outer layer of the modal, while the `div` element with the class
 * `flatfile_close-confirm-modal-inner` contains the inner layout of the modal. Inside
 * the inner layout, there are three elements: a heading with the class
 * `flatfile_modal-heading`, some text with the class `flatfile_modal-text`, and a
 * button group containing two buttons with the classes `flatfile_button` and
 * `flatfile_secondary`. The `onCancel` function is triggered when the secondary
 * button is clicked or when the user cancels the modal, while the `onConfirm` function
 * is triggered when the primary button is clicked.
 */
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
