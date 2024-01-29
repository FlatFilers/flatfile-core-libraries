import { Sheet, Workbook, TextField } from '@flatfile/configure'

const noCustom = new Sheet(
  'noCustom',
  { asdf: TextField() },
  { allowCustomFields: false }
)
const withCustom = new Sheet(
  'withCustom',
  { asdf: TextField() },
  { allowCustomFields: true }
)

export default new Workbook({
  name: 'AllowCustomField Debugging',
  namespace: 'allowCustomDebug',
  sheets: {
    noCustom,
    withCustom,
  },
})
