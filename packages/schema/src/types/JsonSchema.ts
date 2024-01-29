export interface IJsonSchemaProperty {
  title?: string
  description?: string
  enum?: string[]
  enumArray?: { label: string; value: string }[]
  enumLabel?: string[]
  enumLabelArray?: string[]
  field?: string
  format?: string
  isMultiple?: boolean
  enumMatch?: 'exact' | undefined
  items?: {
    type: string | string[]
    enum?: { label: string; value: string }[]
    enumLabel?: string[]
    pattern?: string
    format?: string
  }
  label: string
  minimum?: number
  maximum?: number
  regexp?: {
    cache?: RegExp
    pattern: string
    flags: string
    ignoreBlanks?: boolean
  }
  required?: boolean
  type: string | string[]
  exportDateFormat?: string
  unique?: boolean
  pattern?: string
  primary?: boolean
  $schemaId?: string
  upsert?: boolean
  default?: string
  custom?: boolean
  visibility?: FieldVisibilityTypes
}

export type FieldVisibilityTypes = {
  mapping?: boolean
  review?: boolean
  export?: boolean
}
export interface IJsonSchema {
  properties: Record<string, IJsonSchemaProperty>
  type: string
  name?: string
  required?: string[]
  unique?: string[]
  primary?: string
  linkedProperties?: Record<string, IJsonSchemaProperty>
  allowCustomFields?: boolean
}
