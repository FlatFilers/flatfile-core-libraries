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
import {
  FlatfileSession,
  FlatfileRecord,
  TRecordData,
  TPrimitive,
} from '@flatfile/hooks'

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

const SheetWithLinkUpsertFalse = new Sheet('SheetWithLinkUpsertFalse', {
  nickname: TextField(),
  firstName: LinkedField({
    label: 'First Name',
    sheet: BaseSheet,
    upsert: false,
  }),
})

const RegularOptions = new Sheet(
  'RegularOptions',
  {
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
  },
  {}
)

const OptionsEnumMatchStrat = new Sheet(
  'OptionsEnumMatchStrat',
  {
    selectOptions: OptionField({
      label: 'Lots of options',
      description: 'Select from a list of options',
      matchStrategy: 'exact',
      options: {
        red: 'Red Thing',
        blue: { label: 'Blue Label' },
        orange: { label: 'Orange peel' },
        green: { label: 'Green is the best' },
      },
    }),
  },
  {}
)

const BaseSheetPortal = new Portal({
  name: 'BaseSheetPortal',
  sheet: 'BaseSheet',
})

const SheetWithLinkPortal = new Portal({
  name: 'SheetWithLinkPortal',
  sheet: 'SheetWithLink',
})

const SheetWithLinkUpsertPortal = new Portal({
  name: 'SheetWithLinkUpsertFalsePortal',
  sheet: 'SheetWithLinkUpsertFalse',
})

const RegularOptionsPortal = new Portal({
  name: 'RegularOptionsPortal',
  sheet: 'RegularOptionsPortal',
})

const OptionsEnumMatchStratPortal = new Portal({
  name: 'OptionsEnumMatchStratPortal',
  sheet: 'OptionsEnumMatchStrat',
})

export default new Workbook({
  name: 'Sheet with visibility test',
  namespace: 'visibility-test',
  sheets: {
    BaseSheet,
    SheetWithLink,
    SheetWithLinkUpsertFalse,
    RegularOptions,
    OptionsEnumMatchStrat,
  },
  portals: [
    BaseSheetPortal,
    SheetWithLinkPortal,
    SheetWithLinkUpsertPortal,
    RegularOptionsPortal,
    OptionsEnumMatchStratPortal,
  ],
})
