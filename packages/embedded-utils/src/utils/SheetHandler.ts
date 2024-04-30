import type { Flatfile } from '@flatfile/api'

import { FlatfileClient } from '@flatfile/api'
import { processRecords } from '@flatfile/util-common'

type DataWithMetadata = {
  sheetId: string
  workbookId: string
  records: Flatfile.RecordsWithLinks
}

interface InChunksOptions {
  chunkSize?: number
}

export class SheetHandler {
  private readonly sheetId: string
  private static readonly defaultCount: number = 1000
  private readonly api: FlatfileClient

  constructor(sheetId: string) {
    this.sheetId = sheetId
    this.api = new FlatfileClient()
  }

  async data(
    options: Flatfile.GetRecordsRequest = {}
  ): Promise<DataWithMetadata | undefined> {
    try {
      const { data } = await this.api.sheets.get(this.sheetId)
      const records = await this.api.records.get(this.sheetId, {
        ...options,
      })

      return {
        sheetId: this.sheetId,
        workbookId: data.workbookId,
        records: records.data.records,
      }
    } catch (e) {
      console.error(
        `Failed to get ${options.filter ?? 'all'} data for sheet ID ${
          this.sheetId
        }:`,
        e
      )
    }
  }

  async allData(
    options: Omit<Flatfile.GetRecordsRequest, 'filter'> = {}
  ): Promise<DataWithMetadata | undefined> {
    return this.data({ ...options, filter: 'all' })
  }

  async validData(
    options: Omit<Flatfile.GetRecordsRequest, 'filter'> = {}
  ): Promise<DataWithMetadata | undefined> {
    return this.data({ ...options, filter: 'valid' })
  }

  async errorData(
    options: Omit<Flatfile.GetRecordsRequest, 'filter'> = {}
  ): Promise<DataWithMetadata | undefined> {
    return this.data({ ...options, filter: 'error' })
  }

  private async processRecordsInternal(
    cb: (data: Flatfile.RecordsWithLinks) => void,
    options: InChunksOptions
  ) {
    return await processRecords(
      this.sheetId,
      async (records) => {
        cb(records)
      },
      { pageSize: options.chunkSize || SheetHandler.defaultCount }
    )
  }

  async stream(cb: (data: Flatfile.RecordsWithLinks) => void) {
    return this.processRecordsInternal(cb, {})
  }

  async inChunks(
    cb: (data: Flatfile.RecordsWithLinks) => void,
    options: InChunksOptions
  ) {
    return this.processRecordsInternal(cb, options)
  }
}
