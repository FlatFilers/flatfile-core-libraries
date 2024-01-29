import type { Action, SheetAccess } from '@flatfile/blueprint'
import type { FieldVisibilityTypes } from './JsonSchema'

export type BaseFieldTypes = 'string' | 'number' | 'boolean' | 'composite'

interface BaseField {
  field: string
  label: string
  description?: string
  required?: boolean
  primary?: boolean
  unique?: boolean
  readonly?: boolean
  stageVisibility?: FieldVisibilityTypes
  annotations: {
    default?: boolean
    defaultMessage?: string
    compute?: boolean
    computeMessage?: string
  }
  contributeToRecordCompute?: any
  getSheetCompute?: any
  blueprint?: any
}

export interface BaseSchemaILField extends BaseField {
  type: BaseFieldTypes
}

// Omit "field" because you never know field name when insantiating a Field
export interface BaseSchemaILFieldArgs
  extends Omit<BaseSchemaILField, 'field'> {}

export type EnumOption = {
  value: string | number | boolean
  label: string
}

// type boolOrString = boolean | string
export interface SchemaILEnumField extends BaseField {
  type: 'enum'
  matchStrategy: 'fuzzy' | 'exact'
  labelEnum: Array<EnumOption>
}

export interface LinkedSheetField extends BaseField {
  type: 'schema_ref'
  sheetName: string
  upsert: boolean
}

export interface ReferenceField extends BaseField {
  type: 'reference'
  sheetKey: string
  foreignKey: string
  relationship?: 'has-one' | 'has-many'
}

export type SchemaILFieldArgs =
  | Omit<BaseSchemaILField, 'field'>
  | Omit<SchemaILEnumField, 'field'>
  | Omit<LinkedSheetField, 'field'>
  | Omit<ReferenceField, 'field'>

export type SchemaILField =
  | BaseSchemaILField
  | SchemaILEnumField
  | LinkedSheetField
  | ReferenceField

export interface SchemaILModel<
  Fields extends Record<string, SchemaILField> = Record<string, SchemaILField>
> {
  name: string
  slug: string
  namespace: string
  fields: Fields
  access?: SheetAccess[]
  readonly?: boolean
  required?: Array<keyof Fields | Array<keyof Fields>>
  unique?: Array<keyof Fields | Array<keyof Fields>>
  primary?: keyof Fields
  allowCustomFields: boolean
  actions?: Array<Action>
}
