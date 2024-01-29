import _ from 'lodash'
import type {
  BaseSchemaILField,
  ReferenceField,
  SchemaILEnumField,
  SchemaILField,
  SchemaILModel,
} from './types/SchemaIL'

import type {
  BooleanProperty,
  Constraint,
  EnumProperty,
  EnumPropertyOption,
  NumberProperty,
  Property,
  ReferenceProperty,
  SheetConfig,
  StringProperty,
} from '@flatfile/blueprint'

const getConstraints = (field: SchemaILField): Constraint[] =>
  _.filter([
    field.required ? { type: 'required' } : null,
    field.unique ? { type: 'unique' } : null,
    field?.stageVisibility?.mapping === false ? { type: 'computed' } : null,
  ]) as Constraint[]

const convertBase = (
  field: BaseSchemaILField
): NumberProperty | StringProperty | BooleanProperty => {
  if (field?.stageVisibility?.review === false) {
    console.warn('stageVisibility is not yet supported by X')
  }
  if (field?.stageVisibility?.export === false) {
    console.warn('stageVisibility is not yet supported by X')
  }
  if (field.type === 'composite') {
    console.warn("composite fields aren't supported by X")
    // this should never be seen, composite fields aren't used as SchemaILFields
    return {
      key: field.field,
      type: 'string',
      label: field.label,
    }
  }
  const overrides = field.blueprint || {}
  return {
    constraints: getConstraints(field),
    type: field.type,
    label: field.label,
    key: field.field,
    readonly: field.readonly || false,
    description: field.description,
    ...overrides,
  }
}

const getEnumOptions = (field: SchemaILEnumField): EnumPropertyOption[] => {
  return _.map(
    field.labelEnum,
    ({ value, label }): EnumPropertyOption => ({ value, label })
  )
}

export const convertEnum = (field: SchemaILEnumField): EnumProperty => {
  if (field.matchStrategy === 'exact') {
    console.warn(
      "X doesn't yet support 'matchStrategy':'exact'.  behavior may be unepxected"
    )
  }
  const overrides = field.blueprint || {}

  return {
    constraints: getConstraints(field),
    type: 'enum',
    label: field.label,
    key: field.field,
    description: field.description,
    readonly: field.readonly || false,
    config: {
      options: getEnumOptions(field),
    },
    ...overrides,
  }
}

const convertLinkedField = (field: ReferenceField): ReferenceProperty => {
  const overrides = field.blueprint || {}

  return {
    constraints: getConstraints(field),
    key: field.field,
    label: field.label,
    type: 'reference',
    description: field.description,
    readonly: field.readonly || false,
    config: {
      ref: field.sheetKey,
      key: field.foreignKey,
      relationship: field.relationship || 'has-one',
    },
    ...overrides,
  }
}

export const SchemaILFieldtoProperty = (field: SchemaILField): Property => {
  const ft = field.type
  if (
    ft === 'string' ||
    ft === 'boolean' ||
    ft === 'number' ||
    ft === 'composite'
  ) {
    return convertBase(field)
  } else if (ft === 'enum') {
    return convertEnum(field)
  } else if (ft === 'schema_ref') {
    throw new Error(`LinkedField() of ${field.field} is unsupported in X`)
  } else if (ft === 'reference') {
    return convertLinkedField(field)
  } else {
    throw new Error(
      `Unsupported type: ${field.type} passed to schemaILFieldtoProperty of ${field.field}`
    )
  }
}

export const SchemaILModelToSheetConfig = (
  model: SchemaILModel
): SheetConfig => {
  if (model.allowCustomFields === true) {
    console.warn(
      "X doesn't yet support 'allowCustomFields', behavior may be unepxected"
    )
  }
  const fields = _.values(model.fields).map(SchemaILFieldtoProperty)
  return {
    fields,
    slug: model.slug,
    name: model.name,
    readonly: model.readonly || false,
    actions: model.actions,
    access: model.access,
  }
}
