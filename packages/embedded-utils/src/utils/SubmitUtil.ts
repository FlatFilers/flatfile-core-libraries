import { Flatfile, FlatfileClient } from '@flatfile/api'
import { processRecords } from '@flatfile/util-common'
// TODO - might want to change the records type

type DataWithMetadata = {
  sheetId: string
  workbookId: string
  records: Flatfile.RecordsWithLinks
}

interface InChunksOptions {
  chunkSize?: number
}

export class JobHandler {
  private readonly jobId: string
  private readonly api: FlatfileClient

  constructor(jobId: string) {
    this.jobId = jobId
    this.api = new FlatfileClient()
  }

  async ack() {
    await this.api.jobs.ack(this.jobId)
  }

  async cancel() {
    await this.api.jobs.cancel(this.jobId)
  }

  async complete() {
    await this.api.jobs.complete(this.jobId)
  }

  async fail() {
    await this.api.jobs.fail(this.jobId)
  }

  async get() {
    await this.api.jobs.get(this.jobId)
  }
}

export class SheetHandler {
  private readonly sheetId: string
  private static readonly defaultCount: number = 1000
  private readonly api: FlatfileClient

  constructor(sheetId: string) {
    this.sheetId = sheetId
    this.api = new FlatfileClient()
  }

  async allData(): Promise<DataWithMetadata> {
    const { data } = await this.api.sheets.get(this.sheetId)
    const records = await this.api.records.get(this.sheetId)

    return {
      sheetId: this.sheetId,
      workbookId: data.workbookId,
      records: records.data.records,
    }
  }

  async validData(): Promise<DataWithMetadata> {
    const { data } = await this.api.sheets.get(this.sheetId)
    const records = await this.api.records.get(this.sheetId, {
      filter: 'valid',
    })

    return {
      sheetId: this.sheetId,
      workbookId: data.workbookId,
      records: records.data.records,
    }
  }

  async errorData(): Promise<DataWithMetadata> {
    const { data } = await this.api.sheets.get(this.sheetId)
    const records = await this.api.records.get(this.sheetId, {
      filter: 'error',
    })

    return {
      sheetId: this.sheetId,
      workbookId: data.workbookId,
      records: records.data.records,
    }
  }

  async stream(cb: (data: Flatfile.RecordsWithLinks) => void) {
    return await processRecords(
      this.sheetId,
      async (records) => {
        cb(records)
      },
      { pageSize: SheetHandler.defaultCount }
    )
  }

  async inChunks(
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
}
