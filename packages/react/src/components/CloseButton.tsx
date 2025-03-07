import React from 'react'

export const CloseButton = ({
  handler,
}: {
  handler: React.MouseEventHandler<HTMLButtonElement>
}) => (
  <button
    onClick={handler}
    data-testid="flatfile-close-button"
    type="button"
    className="flatfile-close-button"
    aria-label="Close"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 100 100"
      style={{ margin: 'auto', display: 'block' }}
    >
      <line x1="10" y1="10" x2="90" y2="90" stroke="white" strokeWidth="10" />
      <line x1="10" y1="90" x2="90" y2="10" stroke="white" strokeWidth="10" />
    </svg>
  </button>
)
