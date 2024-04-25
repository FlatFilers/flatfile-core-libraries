export interface State {
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
