import { FlatfileClient } from '@flatfile/api'
import PubNub from 'pubnub'

export const fetchEventToken = async (
  client: FlatfileClient,
  spaceId: string
) => {
  const { data } = await client.events.getEventToken({ spaceId })

  if (!data) {
    throw new Error(`Failed to retrieve event token for space ID: ${spaceId}`)
  }

  if (!data.subscribeKey) {
    throw new Error('Missing subscribe key in event token response')
  }

  if (!data.accountId) {
    throw new Error('Missing account ID in event token response')
  }

  if (!data.token) {
    throw new Error('Missing token in event token response')
  }
  return data
}

export class EventSubscriber {
  public static async getClient(
    spaceId: string,
    accessToken: string,
    apiUrl?: string
  ) {
    const flatfile = new FlatfileClient({
      token: accessToken,
      environment: `${apiUrl || 'https://platform.flatfile.com/api'}/v1`,
    })

    try {
      const data = await fetchEventToken(flatfile, spaceId)

      const pubnub = new PubNub({
        subscribeKey: data.subscribeKey!,
        uuid: data.accountId!,
      })
      pubnub.setToken(data.token!)

      const handleReconnect = async () => {
        console.log('Reconnecting...')
        const data = await fetchEventToken(flatfile, spaceId)

        if (data.token == null) {
          throw new Error('Token is null or undefined')
        }
        pubnub.setToken(data.token)
        pubnub.reconnect()
      }

      const handleAuthentication = async () => {
        console.log('Authenticating...')
        const data = await fetchEventToken(flatfile, spaceId)

        if (!data.token) {
          throw new Error('Error fetching token when re-authenticating')
        }

        pubnub.setToken(data.token)
        pubnub.subscribe({
          channels: [`space.${spaceId}`],
        })
      }

      // Event listener for reconnect
      pubnub.addListener({
        status: function (statusEvent) {
          if (statusEvent.category === 'PNNetworkUpCategory') {
            handleReconnect()
          }
        },
      })

      // Event listener for authentication
      pubnub.addListener({
        status: function (statusEvent) {
          if (statusEvent.category === 'PNNetworkIssuesCategory') {
            handleAuthentication()
          }
        },
      })

      return { pubnub, token: data.token }
    } catch (e) {
      throw new Error(`Failed to get event token: ${e}`)
    }
  }
}
