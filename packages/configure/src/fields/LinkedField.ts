import { Dirty, Field } from '../ddl/Field'
import { makeField, mergeFieldOptions } from '../ddl/MakeField'
import { FieldConfig, Sheet } from '../ddl/Sheet'
import { TextField } from './TextField'

// LinkedField
export const LinkedField = makeField<
  string,
  {
    sheet: Sheet<FieldConfig>
    sheetName?: string
    upsert?: boolean
  }
>(TextField(), {}, (mergedOptions, _newOptions) => {
  const { sheet } = mergedOptions
  const sheetName = mergedOptions.sheetName || sheet.name
  const upsert = mergedOptions.upsert !== false

  const consolidatedOptions = mergeFieldOptions(mergedOptions, {
    type: 'schema_ref',
    sheetName,
    upsert,
    cast: (value) => value,
  })

  return new Field(consolidatedOptions)
})
