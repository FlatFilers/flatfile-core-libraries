import { TextField, BooleanField } from '../fields'
import { Portal } from './Portal'
import { Sheet } from './Sheet'
import { Workbook } from './Workbook'

const OtherSheet = new Sheet(
  'CategoryAndBoolean',
  {
    other: TextField(),
    otherBoolean: BooleanField({}),
  },
  {}
)

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

const CategoryAndBooleanPortal = new Portal({
  name: 'CategoryAndBooleanPortal',
  sheet: 'CategoryAndBoolean',
})

const WorkbookTest = new Workbook({
  name: 'Workbook test',
  namespace: 'test',
  sheets: {
    OtherSheet,
    CategoryAndBoolean,
  },
  portals: [CategoryAndBooleanPortal],
})

describe('Portal test', () => {
  test('verify variables get set properly in Portal', async () => {
    CategoryAndBooleanPortal.setId('embed_id')
    CategoryAndBooleanPortal.setPrivateKeyString('private_key_string')
    expect(CategoryAndBooleanPortal.id).toBe('embed_id')
    expect(CategoryAndBooleanPortal.privateKeyString).toBe('private_key_string')
  })

  test('verify that Portal gets linked to Sheets in Workbook', async () => {
    const { sheets, portals } = WorkbookTest.options
    if (!sheets || !portals) {
      return
    }
    const schemaSlugs = Object.keys(sheets)
    const portalsFound = schemaSlugs.filter((slug) => {
      const portal = portals.find((p: Portal) => p.options.sheet === slug)

      if (portal !== undefined) {
        return portal
      }
    })

    expect(portalsFound).toStrictEqual(['CategoryAndBoolean'])
  })
})
