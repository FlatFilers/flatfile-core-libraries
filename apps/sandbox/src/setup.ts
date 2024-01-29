import {
  Sheet,
  Workbook,
  TextField,
  LinkedField,
  BooleanField,
  DateField,
  Message,
  NumberField,
  OptionField,
  CountryCast,
  Portal,
} from '@flatfile/configure'
import { FlatfileSession, FlatfileRecord } from '@flatfile/hooks'

const BaseSheet = new Sheet(
  'BaseSheet',
  {
    firstName: TextField({
      unique: true,
      primary: true,
    }),
    middleName: TextField('Middle'),
    lastName: TextField(),
  },
  {
    previewFieldKey: 'middleName',
  }
)

const SheetWithLink = new Sheet('SheetWithLink', {
  nickname: TextField(),
  firstName: LinkedField({
    label: 'First Name',
    sheet: BaseSheet,
  }),
})

const NewSheetFromSDK = new Sheet(
  'NewSheetFromSDK',
  {
    firstName: TextField({
      required: true,
      unique: true,
      stageVisibility: {
        review: false,
      },
    }),
    middleName: TextField(),
    lastName: TextField({
      default: 'bar',
      compute: (val: string): string => {
        if (val === 'bar') {
          return 'baz'
        }
        return val
      },
      validate: (val: string): void | Message[] => {
        if (val === 'Rock') {
          throw 'Rock is not allowed'
        }
      },
    }),
    boolean: BooleanField(),
    phoneNumber: TextField({
      default: '555-555-5557',
    }),
    age: NumberField({
      description: 'Age in Dog Years',
    }),
    selectOptions: OptionField({
      label: 'Lots of options',
      description: 'Select from a list of options',
      options: {
        red: 'Red Thing',
        blue: { label: 'Blue Label' },
        orange: { label: 'Orange peel' },
        green: { label: 'Green is the best' },
      },
    }),
    startDate: DateField('Start Date'),
  },
  {
    allowCustomFields: true,
    readonly: true,
    recordCompute(
      record: FlatfileRecord<any>,
      session: FlatfileSession,
      logger: any
    ) {
      const fName = record.get('firstName')
      console.log({ env: session.env })
      logger.info(`lastName was ${record.get('lastName')}`)
      record.set('lastName', fName)
      return record
    },
  }
)

const CountryCastDemo = new Sheet(
  'CountryCastDemo',
  {
    raw: TextField({}),
    full: TextField({ cast: CountryCast('full') }),
    two_letter: TextField({ cast: CountryCast('iso-2') }),
    three_letter: TextField({ cast: CountryCast('iso-3') }),
  },
  {}
)

const NewSheetFromSDKPortal = new Portal({
  name: 'SDK-Portal',
  sheet: 'NewSheetFromSDK',
})

export default new Workbook({
  name: 'Sheet with visibility test',
  namespace: 'visibility-test',
  sheets: {
    BaseSheet,
    SheetWithLink,
    NewSheetFromSDK,
    CountryCastDemo,
  },
  portals: [NewSheetFromSDKPortal],
})
