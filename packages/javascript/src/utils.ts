import { ISpace } from '@flatfile/embedded-utils'
import { createModal } from './createModal'

/**
 * @description Creates an HTML element with a heading and a paragraph containing an
 * error message, then returns the element.
 * 
 * @param {string} errorTitle - heading element that is added to the error container.
 * 
 * @param {string} errorMessage - message to be displayed as an error alert to the
 * user when the function is called.
 * 
 * @returns {HTMLDivElement} a HTML element containing an error title and message.
 * 
 * 	* `div`: The output is a `div` element with the class `ff_error_container`.
 * 	* `h1`: The output includes an `h1` element with the class `ff_error_heading`
 * containing the title specified in the `errorTitle` parameter.
 * 	* `p`: The output includes an `p` element with the class `ff_error_text` containing
 * the error message specified in the `errorMessage` parameter.
 */
export const displayError = (errorTitle: string, errorMessage: string) => {
  const display = document.createElement('div')
  display.classList.add('ff_error_container')
  const title = document.createElement('h1')
  title.classList.add('ff_error_heading')
  const error = document.createElement('p')
  error.classList.add('ff_error_text')

  title.innerText = errorTitle
  error.innerText = errorMessage

  display.appendChild(title)
  display.appendChild(error)

  return display
}

/**
 * Utility function with the responsibility of mounting the confirmation modal and its
 * associate behaviors to the iFrame which is actively being mounted (or was previously preloaded)
 * @param domElement
 * @param displayAsModal
 * @param exitTitle
 * @param exitText
 * @param exitPrimaryButtonText
 * @param exitSecondaryButtonText
 * @param closeSpaceNow
 * @param closeSpace
 * @param onCancel
 */
export function initializeIFrameConfirmationModal(
  domElement: HTMLElement,
  displayAsModal: boolean,
  exitTitle: string,
  exitText: string,
  exitPrimaryButtonText: string,
  exitSecondaryButtonText: string,
  closeSpaceNow: () => void,
  closeSpace?: ISpace['closeSpace'],
  onCancel?: () => void
) {
  // Create the confirmation modal and hide it
  const confirmModal = createModal(
    () => {
      // If user chooses to exit
      const wrappers = Array.from(
        document.getElementsByClassName('flatfile_iframe-wrapper')
      ) as HTMLElement[]
      const modals = Array.from(
        document.getElementsByClassName('flatfile_outer-shell')
      ) as HTMLElement[]

      const elements = [...modals]

      for (let item of elements) {
        document.body.removeChild(item)
      }

      closeSpaceNow()
      if (onCancel) {
        onCancel()
      }
      closeSpace?.onClose?.({})
    },
    () => {
      // If user chooses to stay, we simply hide the confirm modal
      confirmModal.style.display = 'none'
    },
    exitTitle, // pass exitTitle here
    exitText, // pass exitText here,
    exitPrimaryButtonText,
    exitSecondaryButtonText
  )
  confirmModal.style.display = 'none'
  document.body.appendChild(confirmModal)

  if (displayAsModal) {
    const closeButton = document.createElement('div')
    closeButton.innerHTML = `<svg
       xmlns="http://www.w3.org/2000/svg"
       width="24"
       height="24"
       viewBox="0 0 100 100"
     >
       <line x1="10" y1="10" x2="90" y2="90" stroke="white" stroke-width="10" />
       <line x1="10" y1="90" x2="90" y2="10" stroke="white" stroke-width="10" />
     </svg>`
    closeButton.classList.add('flatfile-close-button')
    // Add the onclick event to the button
    closeButton.onclick = () => {
      const outerShell = document.querySelector(
        '.flatfile_outer-shell'
      ) as HTMLElement
      if (outerShell) {
        outerShell.style.display = 'block'
      } else {
        // Show the confirm modal instead of creating a new one
        confirmModal.style.display = 'block'
      }
    }

    domElement
      .getElementsByClassName('flatfile_iframe-wrapper')[0]
      .appendChild(closeButton)
  }
}
