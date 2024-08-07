export function createModal(
  onConfirm: () => void,
  onCancel: () => void,
  exitTitle: () => string,
  exitText: () => string,
  exitPrimaryButtonText: () => string,
  exitSecondaryButtonText: () => string
): { outerShell: HTMLElement; updateText(): void } {
  // Outer Shell
  const outerShell = document.createElement('div')
  outerShell.classList.add('flatfile_outer-shell')

  // Inner Shell
  const innerShell = document.createElement('div')
  innerShell.classList.add('flatfile_inner-shell')

  // Modal
  const modal = document.createElement('div')
  modal.classList.add('flatfile_modal')

  // Button Group
  const buttonGroup = document.createElement('div')
  buttonGroup.classList.add('flatfile_button-group')

  // Modal Heading
  const modalHeading = document.createElement('div')
  modalHeading.classList.add('flatfile_modal-heading')

  // Modal Text
  const modalText = document.createElement('div')
  modalText.classList.add('flatfile_modal-text')

  // 'No, stay' button
  const noStayButton = document.createElement('div')
  noStayButton.classList.add('flatfile_button', 'flatfile_secondary')
  noStayButton.addEventListener('click', (e) => {
    e.stopPropagation()
    onCancel()
  })

  // 'Yes, exit' button
  const yesExitButton = document.createElement('div')
  yesExitButton.classList.add('flatfile_button', 'flatfile_primary')
  yesExitButton.addEventListener('click', (e) => {
    e.stopPropagation()
    onConfirm()
  })

  // Append everything to the modal
  buttonGroup.append(noStayButton, yesExitButton)
  modal.append(modalHeading, modalText, buttonGroup)
  innerShell.appendChild(modal)
  outerShell.appendChild(innerShell)

  function updateText() {
    modalHeading.textContent = exitTitle()
    modalText.textContent = exitText()
    noStayButton.textContent = exitSecondaryButtonText()
    yesExitButton.textContent = exitPrimaryButtonText()
  }
  return { outerShell, updateText }
}
