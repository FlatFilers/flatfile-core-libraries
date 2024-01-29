import api from '@flatfile/api'
import { RecordsWithLinks } from '@flatfile/api/api'
import { processRecords } from '@flatfile/util-common'
// TODO - might want to change the records type

type DataWithMetadata = {
  sheetId: string
  workbookId: string
  records: RecordsWithLinks
}

interface InChunksOptions {
  chunkSize?: number
}

export class JobHandler {
  private readonly jobId: string

  constructor(jobId: string) {
    this.jobId = jobId
  }

  async ack() {
    await api.jobs.ack(this.jobId)
  }

  async cancel() {
    await api.jobs.cancel(this.jobId)
  }

  async complete() {
    await api.jobs.complete(this.jobId)
  }

  async fail() {
    await api.jobs.fail(this.jobId)
  }

  async get() {
    await api.jobs.get(this.jobId)
  }
}

export class SheetHandler {
  private readonly sheetId: string
  private static readonly defaultCount: number = 1000

  constructor(sheetId: string) {
    this.sheetId = sheetId
  }

  async allData(): Promise<DataWithMetadata> {
    const { data } = await api.sheets.get(this.sheetId)
    const records = await api.records.get(this.sheetId)

    return {
      sheetId: this.sheetId,
      workbookId: data.workbookId,
      records: records.data.records,
    }
  }

  async validData(): Promise<DataWithMetadata> {
    const { data } = await api.sheets.get(this.sheetId)
    const records = await api.records.get(this.sheetId, { filter: 'valid' })

    return {
      sheetId: this.sheetId,
      workbookId: data.workbookId,
      records: records.data.records,
    }
  }

  async errorData(): Promise<DataWithMetadata> {
    const { data } = await api.sheets.get(this.sheetId)
    const records = await api.records.get(this.sheetId, { filter: 'error' })

    return {
      sheetId: this.sheetId,
      workbookId: data.workbookId,
      records: records.data.records,
    }
  }

  async stream(cb: (data: RecordsWithLinks) => void) {
    return await processRecords(
      this.sheetId,
      async (records) => {
        cb(records)
      },
      { pageSize: SheetHandler.defaultCount }
    )
  }

  async inChunks(
    cb: (data: RecordsWithLinks) => void,
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
