import Pubnub from 'pubnub'

export interface SpaceComponent {
  spaceId: string
  spaceUrl: string
  accessToken: string
  pubNub?: Pubnub
}
