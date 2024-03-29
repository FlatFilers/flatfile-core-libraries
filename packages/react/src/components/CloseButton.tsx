import React from 'react'

export const CloseButton = ({ handler }: { handler: React.MouseEventHandler<HTMLButtonElement> }) => {
  return (
    <button
      onClick={handler}
      data-testid="flatfile-close-button"
      type="button"
      className="flatfile-close-button"
      aria-label="Close"
      style={{
        position: 'absolute',
        margin: '30px',
        top: '30px',
        right: '30px',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 100 100"
        style={{ margin: 'auto' }}
      >
        <line x1="10" y1="10" x2="90" y2="90" stroke="white" strokeWidth="10" />
        <line x1="10" y1="90" x2="90" y2="10" stroke="white" strokeWidth="10" />
      </svg>
    </button>
  )
}
