import { FlatfileRecords, FlatfileSession } from '@flatfile/hooks'
import { Sheet } from './Sheet'
import { Portal } from './Portal'
import { EventHandler } from '../utils/event.handler'
import { Mountable } from '../utils/mountable'
import { Agent } from './Agent'
import { SpaceConfig } from './SpaceConfig'
import _ from 'lodash'

export class Workbook extends EventHandler implements Mountable {
  public readonly options: IWorkbookOptions
  public targetName = `workbook`
  constructor(options: Partial<IWorkbookOptions>) {
    super()

    // apply defaults
    this.options = {
      namespace: 'default',
      name: 'Default',
      sheets: {},
      labels: [],
      ...options,
    }
    _.map(options.sheets, (sheet, key) => {
      // Add the Sheet key as the slug
      if (!sheet.slug) {
        sheet.slug = key
      }
      sheet.registerActions()
      this.addNode(sheet, key)
    })
  }

  /**
   * Return a default FlatfileConfig if this mounted directly
   */
  mount() {
    return new Agent({
      spaceConfigs: {
        // TODO: this should be a unique slug
        [this.options.slug ?? 'default']: new SpaceConfig({
          name: this.options.name ?? 'Default',
          workbookConfigs: {
            [this.options.slug ?? 'default']: this,
          },
        }),
      },
    })
  }

  getEventTargetName(): string {
    return `workbook(${this.options.namespace})`
  }

  processRecords = async (
    records: FlatfileRecords<any>,
    payload: IHookPayload,
    logger?: any
  ) => {
    // find models identified by target
    const { namespace } = this.options
    const sheetTarget = payload.schemaSlug
    const targets = Object.keys(this.options.sheets)
    const foundTarget = targets.find((t) =>
      sheetTarget.includes(namespace + '/' + t)
    )
    if (foundTarget) {
      return await this.options.sheets[foundTarget].runProcess(
        records,
        payload as FlatfileSession,
        logger
      )
    } else {
      throw new Error(
        ` no target found - namespace: ${namespace}, sheetTarget: ${sheetTarget}, possible targets: ${targets}`
      )
    }
  }

  public async handleLegacyDataHook(payload: IHookPayload) {
    const recordBatch = new FlatfileRecords(
      payload.rows.map((r: { row: any }) => r.row)
    )
    await this.processRecords(recordBatch, payload)

    return recordBatch.toJSON()
  }

  public runHookOnLambda = async ({
    recordBatch,
    session,
    logger,
    eventType = 'records/change',
  }: {
    recordBatch: FlatfileRecords<any>
    session: FlatfileSession
    logger: any
    eventType?: string
  }) => {
    await this.processRecords(recordBatch, session, logger)
    return recordBatch.toJSON()
  }
}

export interface IHookPayload {
  workspaceId: string
  workbookId: string
  schemaId: number
  schemaSlug: string
  uploads: string[]
  rows: any
  endUser?: any // TODO
  env?: Record<string, string | boolean | number>
  envSignature?: string
}

interface IWorkbookOptions {
  namespace: string
  name: string
  slug?: string
  sheets: Record<string, Sheet<any>>
  ref?: string
  labels?: Array<string>
  options?: {}
  settings?: {}
  portals?: Portal[]
}
