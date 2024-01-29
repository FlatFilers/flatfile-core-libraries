import { TextField, BooleanField } from '../fields'
import { Sheet } from './Sheet'
import { Workbook, IHookPayload } from './Workbook'
import { FlatfileRecords, FlatfileSession, IPayload } from '@flatfile/hooks'

const CategoryAndBoolean = new Sheet(
  'CategoryAndBoolean',
  {
    firstName: TextField({
      required: true,
      description: 'foo',
      compute: (v: string) => v.toUpperCase(),
    }),

    testBoolean: BooleanField({}),
  },
  {
    allowCustomFields: true,
    readonly: true,
  }
)

const TestWorkbook = new Workbook({
  name: `Test Workbook`,
  namespace: 'test',
  sheets: { CategoryAndBoolean },
})

const testSession: IPayload = {
  schemaSlug: 'slug',
  workspaceId: '123abc',
  workbookId: '345def',
  schemaId: 1010,
  uploads: ['upload1', 'upload2'],
  endUser: 'alex',
  env: { secret: 'test' },
  envSignature: 'signature',
  rows: [],
}

describe('Workbook tests ->', () => {
  const row1 = { firstName: 'foo', testBoolean: 'true' }
  const iRaw = [{ rawData: row1, rowId: 1 }]
  const recordBatch = new FlatfileRecords(iRaw)

  test('processRecords works', async () => {
    const session = new FlatfileSession({
      ...testSession,
      schemaSlug: 'test/CategoryAndBoolean',
    })

    TestWorkbook.processRecords(recordBatch, session)
    expect(recordBatch.records[0].value).toMatchObject({
      firstName: 'FOO',
      testBoolean: true,
    })
  })

  test('processRecords with useEgressHook works', async () => {
    const row1 = { firstName1: 'foo', testBoolean1: 'true' }
    const iRaw = [{ rawData: row1, rowId: 1 }]
    const recordBatch = new FlatfileRecords(iRaw)

    const CategoryAndBoolean = new Sheet(
      'CategoryAndBoolean',
      {
        firstName1: TextField({
          required: true,
          description: 'foo',
          compute: (v: string) => v.toUpperCase(),
        }),

        testBoolean1: BooleanField({
          egressFormat: (val: boolean) => {
            if (val) {
              return 'TRUE'
            } else {
              return 'false'
            }
          },
        }),
      },
      {
        allowCustomFields: true,
        readonly: true,
      }
    )

    const TestWorkbook = new Workbook({
      name: `Test Workbook`,
      namespace: 'test',
      sheets: { CategoryAndBoolean },
    })

    const session = new FlatfileSession({
      ...testSession,
      schemaSlug: 'test/CategoryAndBoolean',
    })

    //console.log("processRecords", TestWorkbook.processRecords(recordBatch, session))
    await TestWorkbook.processRecords(recordBatch, session)
    expect(recordBatch.records[0].value).toMatchObject({
      firstName1: 'FOO',
      testBoolean1: 'TRUE',
    })
  })
  test('handleLegacyDataHook', async () => {
    const hookRows = [{ row: { rawData: row1, rowId: 1, info: [] } }]
    const formattedpayload = {
      schemaSlug: 'test/CategoryAndBoolean',
      rows: hookRows,
    } as IHookPayload
    const result = await TestWorkbook.handleLegacyDataHook(formattedpayload)

    expect(result[0].row.rawData).toMatchObject({
      firstName: 'FOO',
      testBoolean: true,
    })
  })
})
