import FlatfileListener, { FlatfileEvent } from '@flatfile/listener'
import { ISpace } from '../types'

export const handlePostMessage = (
  closeSpace: ISpace['closeSpace'],
  listener: FlatfileListener,
  onClose?: () => void,
  onInit?: (data: { localTranslations: Record<string, any> }) => void
) => {
  return (message: MessageEvent<{ flatfileEvent: FlatfileEvent }>) => {
    if (message.data && 'localTranslations' in message.data) {
      const localTranslations = message.data.localTranslations as Record<
        string,
        any
      >
      onInit?.({ localTranslations })
      return
    }
    const { flatfileEvent } = message.data
    if (!flatfileEvent) {
      return
    }
    if (
      closeSpace &&
      flatfileEvent.topic === 'job:outcome-acknowledged' &&
      flatfileEvent.payload.status === 'complete' &&
      flatfileEvent.payload.operation === closeSpace.operation &&
      typeof closeSpace.onClose === 'function'
    ) {
      closeSpace.onClose({ event: flatfileEvent })
      onClose?.()
    }
    listener.dispatchEvent(flatfileEvent)
  }
}
