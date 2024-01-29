import { AuthenticatedClient } from './authenticated.client'
import { Event } from '@flatfile/api'

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
  public readonly topic?: string

  public readonly name: string
  public readonly domain: string
  public readonly target: string
  public readonly context: any
  public readonly body: any

  public readonly action?: string

  /**
   * Fetch record data from Flatfile API via the event's dataUrl
   *
   * @async
   * @param {object} options
   * @returns {Promise<any>} JSON
   */
  public data: GetData
  /**
   * Target entity id
   *
   * @example us0_wb_82hgidh9skd
   */
  // public readonly target: string // workbook(PrimaryCRMWorkbook)

  // public readonly context: any // -> [us0_acc_ihjh8943h9w, space_id, workbook_id]
  // public readonly body: any

  constructor(readonly src: Event) {
    super()
    const actionName = src.context.actionName
    const sheetSlug = src.context.sheetSlug
    this.domain = sheetSlug && src.domain === 'workbook' ? 'sheet' : src.domain
    const actionTarget = `${this.domain}(${actionName?.split(':')[0]})`
    this.name = src.topic // workbook:created, file:uploaded
    this.target =
      this.domain === 'file'
        ? 'space(*)'
        : actionName
        ? actionTarget
        : `sheet(${sheetSlug?.split('/').pop()})` // workbook(PrimaryCRMWorkbook)
    this.context = src.context // -> [us0_acc_ihjh8943h9w, space_id, workbook_id]
    this.body = src.payload
    this.action = actionName

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
      return this.body
    }
  }

  /**
   * Fetch the actual body of each context item referenced
   * @param _contexts
   * @todo later
   */
  expand(..._contexts: string[]) {
    // await ev.expand('acccount', 'space')
    // ev.account
    // -> accounts.getAccount('id')
  }

  ack(_progress: number = 100) {
    // call ack API with error
    // only on ackable events
  }
}

export type EventCallback = (evt: FlatfileEvent) => void
