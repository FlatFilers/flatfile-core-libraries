import React from 'react'

export const getIframeStyles = (styles: React.CSSProperties) => {
  return (
    styles ?? {
      width: '100%',
      height: '750px',
      borderWidth: 0,
      background: '#fff',
      boxShadow:
        '0px 4px 6px rgba(154, 160, 185, 0.05), 0px 1px 3px rgba(166, 173, 201, 0.3)',
    }
  )
}

export const getContainerStyles = (isModal: boolean): React.CSSProperties => {
  return isModal
    ? {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box',
        display: 'flex',
        height: '100dvh',
        width: '100dvw',
        left: '0',
        top: '0',
        padding: '50px',
        position: 'fixed',
        zIndex: '1000',
      }
    : {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }
}
