export const getIframeStyles = (styles: any) =>
  styles ?? {
    width: '100%',
    height: '750px',
    borderWidth: 0,
    borderRadius: '20px',
    background: '#fff',
    padding: '16px',
  }

export const getContainerStyles = (isModal: boolean) => {
  if (isModal) {
    return {
      width: 'calc(100% - 100px)',
      height: 'calc(100vh - 40px)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.2)',
      display: 'flex',
      padding: '50px',
    }
  }
  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
}
