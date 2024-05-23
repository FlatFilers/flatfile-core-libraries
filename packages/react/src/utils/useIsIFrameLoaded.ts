import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

export const useIsIFrameLoaded = (
  iframeRef: RefObject<HTMLIFrameElement>
): boolean => {
  const [isIFrameLoaded, setIsIFrameLoaded] = useState<boolean>(false)

  const handler = () => setIsIFrameLoaded(true)

  useEffect(() => {
    iframeRef.current?.addEventListener('load', handler)
    return () => {
      iframeRef.current?.removeEventListener('load', handler)
    }
  }, [iframeRef])
  return isIFrameLoaded
}
