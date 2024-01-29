import { InitializePubnub } from '../types/InitializePubnub'
import { EventSubscriber } from './EventSubscriber'
import { getErrorMessage } from './getErrorMessage'

export const initializePubnub = async ({
  spaceId,
  accessToken,
  apiUrl = 'https://platform.flatfile.com/api',
}: InitializePubnub) => {
  try {
    const response = await EventSubscriber.getClient(
      spaceId,
      accessToken,
      apiUrl
    )
    if (!response) {
      throw new Error('Failed to obtain response from Event Subscriber')
    }
    if (!response.pubnub) {
      throw new Error(
        'Failed to obtain pubnub object from Event Subscriber response'
      )
    }
    return response.pubnub
  } catch (e) {
    throw new Error(`Failed to initialize Pubnub: ${getErrorMessage(e)}`)
  }
}
