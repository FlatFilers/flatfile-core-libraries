import { FlatfileRecords, FlatfileSession, IPayload } from '@flatfile/hooks'
import { TextField, BooleanField } from '../fields'
import { Sheet } from './Sheet'

const CategoryAndBoolean = new Sheet(
  'CategoryAndBoolean',
  {
    firstName: TextField({
      required: true,
      description: 'foo',
      compute: (v: string) => v.toUpperCase(),
    }),
    envField: TextField(),
    testBoolean: BooleanField({}),
  },
  {
    allowCustomFields: true,
    readonly: true,
    recordCompute: (record, session, logger) => {
      if (session?.env?.secret) {
        record.set('envField', session.env.secret)
      }
    },
  }
)

describe('Sheet test', () => {
  test('verify SchemaIL output', async () => {
    expect(
      CategoryAndBoolean.toSchemaIL('fake namespace', 'fake slug')
    ).toMatchObject({
      name: 'CategoryAndBoolean',
      slug: 'fake namespace/fake slug',
      namespace: 'fake namespace',
      fields: {
        firstName: {
          label: 'firstName',
          type: 'string',
          required: true,
          description: 'foo',
        },
        testBoolean: { label: 'testBoolean', type: 'boolean' },
      },
    })
  })

  test('verify runProcess', () => {
    const row1 = {
      firstName: 'foo',
      age: '10',
      testBoolean: 'true',
      envField: '',
    }
    const iRaw = [{ rawData: row1, rowId: 1 }]
    const recordBatch = new FlatfileRecords(iRaw)
    const sample: IPayload = {
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
    const session = new FlatfileSession(sample)
    CategoryAndBoolean.runProcess(recordBatch, session, undefined)

    expect(recordBatch.records[0].value).toMatchObject({
      age: '10',
      firstName: 'FOO',
      testBoolean: true,
      envField: 'test',
    })
  })

  test('verify allowCustomFields works', () => {
    const noCustom = new Sheet(
      'noCustom',
      { asdf: TextField() },
      { allowCustomFields: false }
    )

    const noCustomSIL = noCustom.toJSONSchema('foo', 'bar')
    expect(noCustomSIL).toMatchObject({ allowCustomFields: false })

    const noCustomMissing = new Sheet('noCustom', { asdf: TextField() }, {})
    const noCustomMissingSIL = noCustomMissing.toJSONSchema('foo', 'bar')
    expect(noCustomMissingSIL).toMatchObject({ allowCustomFields: false })

    const withCustom = new Sheet(
      'withCustom',
      { asdf: TextField() },
      { allowCustomFields: true }
    )
    const wCustomSIL = withCustom.toSchemaIL('foo', 'bar')
    expect(wCustomSIL).toMatchObject({ allowCustomFields: true })
  })
})
