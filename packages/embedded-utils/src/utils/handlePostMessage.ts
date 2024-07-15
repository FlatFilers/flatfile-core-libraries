import FlatfileListener, { FlatfileEvent } from '@flatfile/listener'
import { ISpace } from '../types'

export const handlePostMessage = (
  closeSpace: ISpace['closeSpace'],
  listener: FlatfileListener,
  onClose?: () => void,
  onInit?: (data: { localTranslations: Record<string, any> }) => void
) => {
  return (message: MessageEvent<{ flatfileEvent: FlatfileEvent }>) => {
    const { flatfileEvent } = message.data
    if (!flatfileEvent) {
      return
    }
    if (flatfileEvent.topic === 'space:opened') {
      const { localTranslations } = flatfileEvent.payload
      onInit?.({ localTranslations })
    } else if (
      flatfileEvent.topic === 'job:outcome-acknowledged' &&
      flatfileEvent.payload.status === 'complete' &&
      flatfileEvent.payload.operation === closeSpace?.operation &&
      closeSpace &&
      typeof closeSpace.onClose === 'function'
    ) {
      closeSpace.onClose({ event: flatfileEvent })
      onClose?.()
    }
    listener.dispatchEvent(flatfileEvent)
  }
}
