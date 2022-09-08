import { pick, mapValues, keys } from 'remeda'
import { BaseFieldTypes, SchemaILField } from '@flatfile/schema'
import { isFullyPresent } from '../utils/isFullyPresent'

import {
  DateCast,
  BooleanCast,
  NumberCast,
  StringCast,
} from '../stdlib/CastFunctions'
import { Sheet, FieldConfig } from './Sheet'

export type TRecordStageLevel =
  | 'cast'
  | 'required'
  | 'compute'
  //  | 'computedField'  // not sure about this
  | 'validate'
  | 'apply'
  | 'other'

type TRecordLevel = 'error' | 'warn' | 'info'

class Value<T> {
  constructor(
    public readonly value: T,
    public readonly meta: Record<any, any>
  ) {}
}

export type Dirty<T> = string | null | T
export type Nullable<T> = null | T
export type Waitable<T> = T
export type Writable<T> = Waitable<T | Value<T>>

export class Message {
  constructor(
    public readonly message: string,
    public readonly level: TRecordLevel = 'info',
    public readonly stage: TRecordStageLevel
  ) {}
}

export interface IFieldHooks<T> {
  cast: (value: Dirty<T>) => Nullable<T>
  default: Nullable<T>
  compute: (value: T) => T
  validate: (value: T) => void | Message[]
}

export const FieldHookDefaults = <T>(): IFieldHooks<T> => ({
  cast: (value: Dirty<T>) => {
    if (value != null) {
      return value as T
    }
    return null
  },
  default: null,
  compute: (value: T) => value,
  validate: () => [],
})

export interface GenericFieldOptions {
  description: string
  type: BaseFieldTypes
  label: string
  primary: boolean
  required: boolean
  unique: boolean
  stageVisibility?: {
    mapping?: boolean
    review?: boolean
    export?: boolean
  }
}

const GenericDefaults: GenericFieldOptions = {
  description: '',
  label: '',
  type: 'string',
  primary: false,
  required: false,
  unique: false,
  stageVisibility: {
    mapping: true,
    review: true,
    export: true,
  },
}

export type BaseFieldOptions<T> = Partial<SchemaILField> &
  Partial<IFieldHooks<T>>

export type FullBaseFieldOptions<T, O> = SchemaILField & IFieldHooks<T> & O

export class Field<T, O extends Record<string, any>> {
  public constructor(
    public options: FullBaseFieldOptions<T, O> = {} as FullBaseFieldOptions<
      T,
      O
    >
  ) {}

  public addCustomOptionsToField(
    cb: (options: FullBaseFieldOptions<T, O>) => void
  ) {
    cb(this.options)
  }

  // leaving this as a public field and not adding it to the default
  // constructor because this is a very advanced field feature to use,
  // it can be set on an instantiated field

  public extraFieldsToAdd: Record<string, Field<any, any>> = {}

  public computeToValue(rawValue: any): [Nullable<T>, Nullable<Message>] {
    try {
      const possiblyCast = this.options.cast(rawValue)
      if (typeof possiblyCast === 'undefined') {
        throw new Error(
          `casting ${rawValue} returned undefined.  This is an error, fix 'cast' function`
        )
      }

      const actuallyCast =
        !isFullyPresent(possiblyCast) && isFullyPresent(this.options.default)
          ? this.options.default
          : possiblyCast

      if (isFullyPresent(actuallyCast)) {
        try {
          const reallyActuallyCast: T = actuallyCast as T
          const computed = this.options.compute(actuallyCast as T)
          if (typeof computed === 'undefined') {
            throw new Error(
              `calling compute of ${rawValue} with typed value of ${reallyActuallyCast} returned undefined.  This is an error, fix 'compute' function`
            )
          }
          return [computed, null]
        } catch (e: any) {
          return [rawValue, new Message(e.toString(), 'error', 'compute')]
        }
      } else {
        if (this.options.required) {
          return [null, new Message('missing value', 'error', 'required')]
        }
        return [null, null]
      }
    } catch (e: any) {
      return [rawValue, new Message(e.toString(), 'error', 'cast')]
    }
  }

  public validate(val: T) {
    try {
      return this.options.validate(val)
    } catch (e: any) {
      return [new Message(e.toString(), 'error', 'validate')]
    }
  }

  public toSchemaILField(fieldName: string): SchemaILField {
    return {
      field: fieldName,
      label: this.options.label || fieldName,
      ...pick(this.options, [
        'type',
        'description',
        'required',
        'primary',
        'unique',
        'labelEnum',
        'sheetName',
        'stageVisibility',
      ]),
    }
  }

  public contributeToSchemaILFBase() {
    //add whatever pieces this field needs to add to the base sheet
    //definition, possible additonal processing at the Sheet level
  }

  public setProp(prop: Partial<FullBaseFieldOptions<T, O>>) {
    this.options = {
      ...this.options,
      ...prop,
    }
    return this
  }
}

type PartialBaseFieldsAndOptions<T, O> = Partial<FullBaseFieldOptions<T, O>>
type FieldOverload<T, O> = {
  (): Field<T, O>
  (label?: string): Field<T, O>
  (options?: PartialBaseFieldsAndOptions<T, O>): Field<T, O>
}

function makeField<T extends any, O extends Record<string, any> = {}>(
  fieldFactory: (
    field: Field<T, O>,
    options: FullBaseFieldOptions<T, O>
  ) => (options: FullBaseFieldOptions<T, O>) => Field<T, O>
) {
  const fieldMaker: FieldOverload<T, O> = (
    options?: string | PartialBaseFieldsAndOptions<T, O>
    // options?: PartialBaseFieldsAndOptions<T, O>
  ): Field<T, O> => {
    // if labelOptions is a string, then it is the label
    const label = typeof options === 'string' ? options : undefined
    // if options is an object, then it is the options
    const passedOptions =
      (typeof options !== 'string' ? options : options) ?? {}

    const passedStageVisibility = (passedOptions as SchemaILField)
      ?.stageVisibility

    const stageVisibility = {
      ...GenericDefaults.stageVisibility,
      ...passedStageVisibility,
    }

    const fullOpts = {
      ...GenericDefaults,
      ...FieldHookDefaults<T>(),
      ...(label ? { label } : { ...passedOptions }),
      stageVisibility,
    }

    const field = new Field<T, O>(fullOpts as FullBaseFieldOptions<T, O>)
    const fieldOptions = fieldFactory(
      field,
      passedOptions as FullBaseFieldOptions<T, O>
    )

    field.addCustomOptionsToField(fieldOptions)
    return field
  }

  return fieldMaker
}

// TextField
export const TextField = makeField<string>((field, passedOptions) => {
  return () => {
    const cast = passedOptions.cast ?? StringCast
    return field.setProp({ type: 'string', cast })
  }
})

// BooleanField
export const BooleanField = makeField<boolean, { superBoolean?: boolean }>(
  (field, passedOptions) => {
    return () => {
      const cast = passedOptions.cast ?? BooleanCast
      return field.setProp({ type: 'boolean', cast })
    }
  }
)

// NumberField
export const NumberField = makeField<number>((field, passedOptions) => {
  return () => {
    const cast = passedOptions.cast ?? NumberCast
    return field.setProp({ type: 'number', cast })
  }
})

// NumberField
export const DateField = makeField<Date>((field, passedOptions) => {
  return () => {
    const cast = passedOptions.cast ?? DateCast
    return field.setProp({ type: 'string', cast })
  }
})

// OptionField
type LabelOptions = string | { label: string }

export const OptionField = makeField<
  string,
  { options: Record<string, LabelOptions> }
>((field) => {
  const def_ = field.options.default
  if (def_ !== null) {
    //type guard to make typescript happy
    if (isFullyPresent(def_) && field.options.options[def_] === undefined) {
      throw new Error(
        `Invalid default of ${def_}, value doesn't appear as one of the keys in ${keys(
          field.options.options
        )}`
      )
    }
  }
  const labelEnum = mapValues(field.options.options, (value) => {
    const label = typeof value === 'string' ? value : value.label
    return label
  })

  return () => field.setProp({ type: 'enum', labelEnum })
})

// LinkedField
export const LinkedField = makeField<string, { sheet: Sheet<FieldConfig> }>(
  (field) => {
    const { sheet } = field.options
    const sheetName = sheet.name

    return () => field.setProp({ type: 'schema_ref', sheetName })
  }
)
