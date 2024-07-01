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
  if (isModal) {
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      display: 'flex',
      height: 'calc(100vh - 40px)',
      width: 'calc(100% - 100px)',
      padding: '50px',
      position: 'fixed',
      zIndex: '1000',
    }
  } else {
    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }
  }
}
