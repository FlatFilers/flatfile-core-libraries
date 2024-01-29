import Pubnub from 'pubnub'

export interface State {
  pubNub?: Pubnub | null
  error?: Error | string
  localSpaceId: string
  accessTokenLocal: string
  spaceUrl: string
}

export interface InitState {
  error?: Error | string
  localSpaceId: string | null
  accessTokenLocal: string | null
}
