import { keys, mapValues } from 'remeda'
import { Field } from '../ddl/Field'
import { makeField, mergeFieldOptions } from '../ddl/MakeField'
import { isFullyPresent } from '../utils/isFullyPresent'
import { TextField } from './TextField'

type LabelObject = { label: string; value?: string | number | boolean }
// OptionField
type LabelOptions = string | LabelObject

export const OptionField = makeField<
  string,
  {
    matchStrategy?: 'fuzzy' | 'exact'
    options: Record<string, LabelOptions>
  }
>(TextField(), { type: 'enum' }, (mergedOptions, _newOptions) => {
  const def_ = mergedOptions.default

  if (def_ !== null) {
    //type guard to make typescript happy
    if (isFullyPresent(def_) && mergedOptions.options[def_] === undefined) {
      throw new Error(
        `Invalid default of ${def_}, value doesn't appear as one of the keys in ${keys(
          mergedOptions.options
        )}`
      )
    }
  }
  const labelEnum = Object.entries(mergedOptions.options).map(
    ([optionKey, optionValue]) => ({
      value:
        typeof optionValue === 'string'
          ? optionKey
          : Object.prototype.hasOwnProperty.call(optionValue, 'value') &&
            optionValue.value !== undefined
          ? optionValue.value
          : optionKey,
      label: typeof optionValue === 'string' ? optionValue : optionValue.label,
    })
  )

  const consolidatedOptions = mergeFieldOptions(mergedOptions, {
    labelEnum,
    matchStrategy: mergedOptions.matchStrategy || 'fuzzy',
  })
  return new Field(consolidatedOptions)
})
