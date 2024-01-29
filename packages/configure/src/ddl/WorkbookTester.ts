import _ from 'lodash'

import { IHookPayload } from '@flatfile/configure'
import { Workbook } from './Workbook'
import { Message } from './Field'

import {
  IRawRecordWithInfo,
  IRecordInfo,
  TPrimitive,
  TRecordData,
} from '@flatfile/hooks'
import { SheetOptions, Sheet } from './Sheet'

export class WorkbookTester {
  public workbook
  constructor(
    public readonly fields: any,
    public readonly passedOptions: Partial<SheetOptions<any>>
  ) {
    const TestSheet = new Sheet('test', fields, passedOptions)
    //TestSheet.usePlugin('test', new UniqueAndRequiredPlugin())

    const TestWorkbook = new Workbook({
      name: `Test Workbook`,
      namespace: 'test',
      sheets: {
        TestSheet,
      },
    })
    this.workbook = TestWorkbook
  }

  public async checkRows({
    data,
    expectedOutput,
    expectedDuplicates,
    expectedMissingFields,
  }: {
    data: any[]
    expectedOutput?: any[]
    expectedDuplicates?: { [x: string]: number[] }
    expectedMissingFields?: { [x: string]: number[] }
  }): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rows = _.map(data, (rawData: any, i: number) => {
      return { row: { rawData, rowId: i + 1 }, info: [] }
    })
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows,
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)
    const formatResult = result.map((record) => record.row.rawData)

    expectedOutput && expect(expectedOutput).toStrictEqual(formatResult)
    if (expectedDuplicates) {
      const duplicatesFound = this.detectMessagesLike(result, {
        level: 'error',
        stage: 'other',
        message: 'Value must be unique',
      })
      expect(duplicatesFound).toStrictEqual(expectedDuplicates)
    }
    if (expectedMissingFields) {
      const missingFieldsFound = this.detectMessagesLike(result, {
        level: 'error',
        stage: 'other',
        message: 'Required Value',
      })
      expect(missingFieldsFound).toStrictEqual(expectedMissingFields)
    }
  }

  public async checkForDuplicates(
    rawDs: any[]
  ): Promise<{ [x: string]: number[] } | null> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rows = _.map(rawDs, (rawData: any, i: number) => {
      return { row: { rawData, rowId: i + 1 }, info: [] }
    })
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows,
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)
    return this.detectMessagesLike(result, {
      level: 'error',
      stage: 'other',
      message: 'Value must be unique',
    })
  }

  public async checkForMissingFields(
    rawDs: any[]
  ): Promise<{ [x: string]: number[] } | null> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rows = _.map(rawDs, (rawData: any, i: number) => {
      return { row: { rawData, rowId: i + 1 }, info: [] }
    })
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows,
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    return this.detectMessagesLike(result, {
      level: 'error',
      stage: 'other',
      message: 'Required Value',
    })
  }

  public async checkRowResult({
    rawData,
    expectedOutput,
    message,
    messages,
  }: {
    rawData: any
    expectedOutput?: any
    message?: string | boolean
    messages?: IRecordInfo<TRecordData<TPrimitive>, string | number>[]
  }): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    expectedOutput &&
      expect(result[0].row.rawData).toMatchObject(expectedOutput)

    // explicitly check for no messages
    if (message === false) {
      expect(result[0].info[0]).toBe(undefined)
    } else {
      message && expect(result[0].info[0].message).toBe(message)
    }

    if (messages && messages.length > 0) {
      messages.forEach((message) => {
        expect(result[0].info).toEqual(
          expect.arrayContaining([expect.objectContaining(message)])
        )
      })
    }
  }

  public async checkRowMessage({
    rawData,
    message,
  }: {
    rawData: any
    message?: any
  }): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)
    expect(message).toBeTruthy()

    message && expect(result[0].info[0].message).toBe(message)
  }

  private detectMessagesLike(
    records: IRawRecordWithInfo<TRecordData<TPrimitive>>[],
    message: Partial<IRecordInfo<TRecordData<TPrimitive>, string | number>>
  ): any {
    const fieldLocation: { [x: string]: number[] } = {}
    if (message) {
      for (let record of records) {
        const duplicatesFound = _.filter(record.info, message)
        if (duplicatesFound) {
          for (let duplicate of duplicatesFound) {
            if (fieldLocation[duplicate.field]) {
              fieldLocation[duplicate.field].push(Number(record.row.rowId))
            } else {
              fieldLocation[duplicate.field] = [Number(record.row.rowId)]
            }
          }
        }
      }

      return Object.keys(fieldLocation).length === 0 ? null : fieldLocation
    }
  }
}

export class FieldTester {
  public workbook
  constructor(public readonly field: any) {
    const TestSheet = new Sheet('test', { a: field }, {})

    const TestWorkbook = new Workbook({
      name: `Test Workbook`,
      namespace: 'test',
      sheets: {
        TestSheet,
      },
    })
    this.workbook = TestWorkbook
  }

  public async checkRowResult({
    rawData,
    expectedOutput,
    message,
  }: {
    rawData: any
    expectedOutput?: any
    message?: any
  }): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    expectedOutput &&
      expect(result[0].row.rawData).toMatchObject(expectedOutput)
    message && expect(result[0].info[0].message).toBe(message)
  }

  public async checkFieldResult(
    inputVal: any,
    expectedOutputVal: any
  ): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rawData = { a: inputVal }
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    const resultVal = result[0].row.rawData['a']
    expect(resultVal).toBe(expectedOutputVal)
  }

  public async checkFieldMessage(
    inputVal: any,
    expectedMessage: any
  ): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rawData = { a: inputVal }
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)
    if (expectedMessage === false) {
      //special case for explicitly looking for no message
      expect(result[0].info).toStrictEqual([])
    } else {
      expect(expectedMessage).toBeTruthy()
      expectedMessage && expect(result[0].info[0].message).toBe(expectedMessage)
    }
  }

  public async matchFieldMessage(
    inputVal: any,
    expectedMessage: Message | boolean
  ): Promise<void> {
    const targets = Object.keys(this.workbook.options.sheets)
    const rawData = { a: inputVal }
    const formattedpayload = {
      schemaSlug: this.workbook.options.namespace + '/' + targets[0],
      rows: [{ row: { rawData, rowId: 1 }, info: [] }],
    } as IHookPayload
    const result = await this.workbook.handleLegacyDataHook(formattedpayload)

    if (expectedMessage === false) {
      //in this case we are expecting no messages
      expect(result[0].info[0]).toBe(undefined)
      return
    }
    expect(expectedMessage).toBeTruthy()
    expectedMessage && expect(result[0].info[0]).toMatchObject(expectedMessage)
  }

  public async testFullHooks(
    inputVal: string | undefined,
    outputVal: number | undefined | null
  ): Promise<void> {
    await this.checkRowResult({
      rawData: { a: inputVal },
      expectedOutput: { a: outputVal },
    })
  }

  public async testFull(
    inputVal: string | undefined,
    outputVal: number | undefined | null,
    message: string
  ): Promise<void> {
    await this.checkRowResult({
      rawData: { a: inputVal },
      expectedOutput: { a: outputVal },
      message,
    })
  }
}
