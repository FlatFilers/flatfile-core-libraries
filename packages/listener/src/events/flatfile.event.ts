import { AuthenticatedClient } from './authenticated.client'

import { Event, RecordsWithLinks } from '@flatfile/api/api'
import { EventCache } from './cache'

import pako from 'pako'

type GetDataOptions = { [key: string]: any }
interface GetData extends Function {
  (options?: GetDataOptions): Promise<any>
  then<TResult1 = any, TResult2 = any>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>
}

export class FlatfileEvent extends AuthenticatedClient {
  /**
   * Event ID from the API
   *
   * @example us0_ev_82hgidh9skd
   * @readonly
   *
   */
  public readonly id?: string

  /**
   * Topic the event was produced on
   *
   * @example workbook:created
   * @readonly
   */
  public readonly topic: string
  public readonly domain: string
  public readonly target: string
  public readonly origin: object
  public readonly action: string
  public readonly context: any
  public readonly payload: any
  public readonly cache: EventCache
  public readonly namespace: string[]
  public readonly createdAt?: Date
  /**
   * Fetch record data from Flatfile API via the event's dataUrl
   *
   * @async
   * @param {object} options
   * @returns {Promise<any>} JSON
   */
  public data: GetData

  constructor(
    public readonly src: Event,
    accessToken?: string,
    apiUrl?: string
  ) {
    super(accessToken, apiUrl)
    this.cache = new EventCache()
    this.domain = src.domain
    this.topic = src.topic
    this.context = src.context // -> [us0_acc_ihjh8943h9w, space_id, workbook_id]
    this.payload = src.payload
    this.target = src.target || ''
    this.origin = src.origin || {}
    this.action = src.context?.actionName || ''
    this.namespace = src.namespaces || []
    this.createdAt = src.createdAt || undefined

    const data = async (options?: GetDataOptions): Promise<any> =>
      this.fetchData(options)

    data.then = <TResult1 = any, TResult2 = any>(
      onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> => {
      return this.data().then(onfulfilled, onrejected)
    }

    this.data = data
  }

  /**
   * Should return either event body if expanded already or fetch data from the
   * signed dataURL
   */
  private async fetchData(options?: GetDataOptions): Promise<any> {
    const dataUrl = new URLSearchParams(this.src.dataUrl)
    if (options) {
      for (const [key, values] of Object.entries(options)) {
        if (Array.isArray(values)) {
          for (const value of values) {
            dataUrl.append(key, value)
          }
        } else {
          dataUrl.append(key, values)
        }
      }
    }
    const decodedURL = decodeURIComponent(dataUrl.toString())
    if (decodedURL) {
      return this.fetch(decodedURL)
    } else {
      return this.payload
    }
  }

  private afterAllCallbacks: Map<any, any> = new Map()
  afterAll<T>(callback: () => T, cacheKey?: string): void {
    const key = cacheKey || callback.toString()
    if (!this.afterAllCallbacks.get(key)) {
      this.afterAllCallbacks.set(key, callback)
    }
  }

  async update(records: RecordsWithLinks, compressRequestBody = true) {
    if (!this.src.dataUrl) {
      throw new Error('Cannot set data on an event without a dataUrl')
    }

    // TODO: do we need to remove source from the messages array?
    records.map((record) => {
      record.messages?.map((message) => {
        delete message.source
      })
    })

    const data = compressRequestBody
      ? pako.gzip(JSON.stringify(records))
      : records

    const headers = compressRequestBody
      ? { 'Content-Encoding': 'gzip', 'Content-Length': data.length.toString() }
      : {}

    await this.fetch(this.src.dataUrl, {
      method: 'PUT',
      headers: headers,
      data,
    })
  }

  /**
   * Fetch the Secrets as indicated by this event context
   *
   * @param key - The name of the secret to fetch
   * @param options - (Optional) environmentId and spaceId to override event context
   *
   * @returns The value of the secret (usually a credential or token)
   */
  async secrets(
    key: string,
    options?: { environmentId?: string; spaceId?: string, actorId?: string }
  ) {
    // Allow options overrides, then take from context, else are absent
    const environmentId =
      options?.environmentId || this.context.environmentId || ''
    const spaceId = options?.spaceId || this.context.spaceId || ''
    const actorId = options?.actorId || this.context.actorId || ''

    if (!environmentId) {
      throw new Error('environmentId is required to fetch secrets')
    }

    let getSecrets = `v1/secrets?environmentId=${environmentId}`

    if (spaceId) {
      getSecrets += `&spaceId=${spaceId}`
    }

    if (actorId) {
      getSecrets += `&actorId=${actorId}`
    }

    const secretCacheKey = `secrets:${environmentId}${spaceId && `:${spaceId}`}${actorId && `:${actorId}`}`

    const secrets = await this.cache.init(secretCacheKey, async () => {
      const secretsResponse = await this.fetch(getSecrets)
      const SecretMap = new Map<string, string>()
      secretsResponse?.forEach((secret: { name: string; value: string }) => {
        SecretMap.set(secret.name, secret.value)
      })
      return SecretMap
    })

    const value = secrets.get(key)
    if (!value) {
      throw new Error(`Secret ${key} not found`)
    }
    return value
  }
}

export type EventCallback = (evt: FlatfileEvent) => void | Promise<void>
