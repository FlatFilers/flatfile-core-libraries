import type {
  SchemaILModel,
  SchemaILField,
  SchemaILEnumField,
  LinkedSheetField,
} from './types/SchemaIL'
import type { IJsonSchema, IJsonSchemaProperty } from './types/JsonSchema'
import {
  filter,
  fromPairs,
  isTruthy,
  map,
  mapValues,
  pick,
  pipe,
  values,
} from 'remeda'

//note the second any is for properties that should be contributed to
//the larger schema outside of just this field
export const compileEnum = (
  inputField: SchemaILEnumField
): IJsonSchemaProperty => {
  // return the field if it is not an enum type
  const retVal: IJsonSchemaProperty = {
    type: 'string',
    label: inputField.label,
    ...(inputField.required ? { required: inputField.required } : {}),
    enum: inputField.labelEnum.map(({ value }) => value.toString()),
    description: inputField.description,
    enumLabel: inputField.labelEnum.map(({ label }) => label.toString()),
  }
  if (inputField.matchStrategy === 'exact') {
    retVal.enumMatch = 'exact'
  }
  return retVal
}

export const compileLinkedField = (
  inputField: LinkedSheetField
): IJsonSchemaProperty => {
  const retVal: IJsonSchemaProperty = {
    type: 'schema_ref',
    label: inputField.label,
    upsert: undefined,
    $schemaId: inputField.sheetName,
    ...(inputField.required ? { required: inputField.required } : {}),
  }

  if (inputField.upsert === false) {
    retVal.upsert = false
  }
  return retVal
}

export const compileSpecific = (
  inputField: SchemaILField
): IJsonSchemaProperty => {
  if (inputField.type === 'schema_ref') {
    return compileLinkedField(inputField)
  } else if (inputField.type === 'enum') {
    return compileEnum(inputField)
  } else if (inputField.type === 'reference') {
    throw new Error(
      `ReferenceField() of ${inputField.field} is unsupported in Flatfile Mono`
    )
  }
  return inputField
}

export const SchemaILToJsonSchema = (ddl: SchemaILModel): IJsonSchema => {
  const fields = pipe(
    ddl.fields,
    mapValues(
      (value, field): SchemaILField =>
        ({
          field,
          ...compileSpecific(value),
        } as SchemaILField)
    ),
    values
  )

  const required = pipe(
    fields,
    filter((f) => isTruthy(f.required)),
    map((f) => f.field)
  )

  const unique = pipe(
    fields,
    filter((f) => isTruthy(f.unique)),
    map((f) => f.field)
  )

  const pks = pipe(
    fields,
    filter((f) => isTruthy(f.primary)),
    map((f) => f.field)
  )

  const properties = pipe(
    fields,
    map((f) =>
      tuple(f.field, {
        ...pick(f as IJsonSchemaProperty, [
          'type',
          'label',
          'field',
          'enum',
          'enumLabel',
          'enumMatch',
          'description',
          '$schemaId',
          'upsert',
        ]),
        visibility: f.stageVisibility,
        //...(f.type === 'schema_ref' ? { $schemaId: f.sheetName } : {}),
      })
    ),
    (v) => fromPairs(v)
  )

  return {
    properties,
    type: 'object',
    required: required,
    unique: unique,
    primary: pks[0],
    allowCustomFields: ddl.allowCustomFields,
  }
}

export const compileToJsonSchema = SchemaILToJsonSchema

function tuple<A, B>(a: A, b: B): [A, B] {
  return [a, b]
}
