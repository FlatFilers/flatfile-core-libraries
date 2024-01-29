import { Field } from '../ddl/Field'
import { makeField, mergeFieldOptions } from '../ddl/MakeField'
import { FieldConfig, Sheet } from '../ddl/Sheet'
import { TextField } from './TextField'

export type ReferenceRelationship = 'has-one' | 'has-many'

export const ReferenceField = makeField<
  string,
  {
    sheetKey: string
    foreignKey: string
    relationship?: ReferenceRelationship
  }
>(TextField(), {}, (mergedOptions) => {
  const { sheetKey, foreignKey } = mergedOptions

  const consolidatedOptions = mergeFieldOptions(mergedOptions, {
    type: 'reference',
    sheetKey,
    foreignKey,
  })

  return new Field(consolidatedOptions)
})
