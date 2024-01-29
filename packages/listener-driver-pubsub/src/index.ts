import { EventDriver } from '@flatfile/listener'
import api, { Flatfile } from '@flatfile/api'
import PubNub, { PubnubStatus } from 'pubnub'
import { axiosInterceptor, Debugger } from '@flatfile/utils-debugger'
import axios from 'axios'

export class PubSubDriver extends EventDriver {
  public events = new Map()
  public pubnub?: PubNub
  constructor(private scope: string) {
    super()
  }

  async start(immediate: boolean = false) {
    axiosInterceptor(axios)
    return new Promise((resolve, reject) => {
      const connect = async () => {
        if (!this.scope) {
          throw new Error(
            'scope is required (must be an environment or space id)'
          )
        }

        const getToken = async (): Promise<Flatfile.spaces.EventToken> => {
          const { data: token } = await api.events.getEventToken({
            scope: this.scope,
          })
          return token
        }
        const token = await getToken()

        const pubnub = new PubNub({
          subscribeKey: token.subscribeKey!,
          subscribeRequestTimeout: 30_000,
          userId: token.accountId!,
          restore: true,
        })
        this.pubnub = pubnub

        pubnub.setToken(token.token!)
        pubnub.addListener({
          status: (event: PubNub.StatusEvent | PubnubStatus) => {
            if (
              event.category === 'PNConnectedCategory' &&
              event.operation === 'PNSubscribeOperation'
            ) {
              Debugger.logSuccess(
                `Connected to event stream for scope ${this.scope}`
              )
              resolve(pubnub)
            }
            if ('error' in event && event.error) {
              Debugger.logError(
                event.errorData?.message,
                event.operation,
                event.category
              )

              if (event.category === 'PNAccessDeniedCategory') {
                Debugger.logInfo('Attempting to reauthenticate...')
                getToken().then((token) => {
                  pubnub.setToken(token.token!)
                  pubnub.reconnect()
                  Debugger.logSuccess('Reconnected')
                })
              }
            }
          },
          message: async (event) => {
            try {
              const e =
                typeof event.message === 'string'
                  ? JSON.parse(event.message)
                  : event.message
              // todo: determine if prepTargetForEvent is available here
              if (this.events.get(e.id)) {
                return
              }
              this.events.set(e.id, true)
              const listeners = this._handler?.getListeners(e, true)
              if (listeners?.length) {
                Debugger.logEvent(e)
                listeners.forEach(({ query, filter }) => {
                  Debugger.logEventSubscriber(query, filter)
                })
                await this._handler?.dispatchEvent(e)
              }
            } catch (e) {
              console.error(e)
            }
          },
        })
        const scopeSignature = this.scope.includes('env')
          ? 'environment'
          : 'space'
        pubnub.subscribe({ channels: [scopeSignature + '.' + this.scope] })
      }
      // resolve happens in the pubnub listener above
      connect()
        .catch(reject)
        .finally(() => {
          if (immediate) {
            resolve(this.pubnub)
          }
        })
    })
  }

  /**
   * Shutdown the pubnub stream
   */
  shutdown() {
    this.pubnub?.unsubscribeAll()
    this.pubnub?.stop()
  }
}
