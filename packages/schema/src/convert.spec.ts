import { IJsonSchema } from './types/JsonSchema'
import { SchemaILModel } from './types/SchemaIL'
import {
  compileEnum,
  SchemaILToJsonSchema,
  compileToJsonSchema,
} from './convert'

const jsonSchema: IJsonSchema = {
  properties: {
    first_name: { type: 'string', label: 'First Name', field: 'first_name' },
    id: { type: 'number', label: 'Id', field: 'id' },
    is_admin: { type: 'boolean', label: 'Is Admin', field: 'is_admin' },
    color: {
      type: 'string',
      label: 'Color',
      field: 'color',

      enum: ['red', 'blue', 'green'],
      enumLabel: ['Red', 'Blue', 'Green'],
    },
  },
  type: 'object',
  required: ['first_name', 'id'],
  unique: ['id'],
  primary: 'id',
  allowCustomFields: false,
}

const ddlSchema: SchemaILModel = {
  fields: {
    first_name: {
      type: 'string',
      label: 'First Name',
      required: true,
      annotations: {},
      field: 'first_name',
    },
    id: {
      type: 'number',
      label: 'Id',
      required: true,
      primary: true,
      unique: true,
      annotations: {},
      field: 'id',
    },
    is_admin: {
      type: 'boolean',
      label: 'Is Admin',
      required: false,
      annotations: {},
      field: 'is_admin',
    },
    color: {
      field: 'color',
      label: 'Color',
      matchStrategy: 'fuzzy',
      type: 'enum',
      annotations: {},
      labelEnum: [
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green' },
      ],
      required: false,
    },
  },
  name: 'testSchema',
  slug: 'test',
  namespace: 'testspace',
  allowCustomFields: false,
}

describe('compiler tests', () => {
  it('checks enum compile function', () => {
    expect(
      compileEnum({
        type: 'enum',
        matchStrategy: 'fuzzy',
        label: 'Color',
        field: 'color',
        annotations: {},
        labelEnum: [
          { value: 'red', label: 'Red' },
          { value: 'blue', label: 'Blue' },
          { value: 'green', label: 'Green' },
        ],
      })
    ).toMatchObject({
      type: 'string',
      label: 'Color',
      enum: ['red', 'blue', 'green'],
      enumLabel: ['Red', 'Blue', 'Green'],
    })
    expect(
      compileEnum({
        type: 'enum',
        matchStrategy: 'exact',
        label: 'Color',
        field: 'color',
        annotations: {},
        labelEnum: [
          { value: 'red', label: 'Red' },
          { value: 'blue', label: 'Blue' },
          { value: 'green', label: 'Green' },
        ],
      })
    ).toMatchObject({
      type: 'string',
      label: 'Color',
      enumMatch: 'exact',
      enum: ['red', 'blue', 'green'],
      enumLabel: ['Red', 'Blue', 'Green'],
    })
    expect(
      compileEnum({
        type: 'enum',
        matchStrategy: 'exact',
        description: 'a couple of words',
        label: 'Color',
        field: 'color',
        annotations: {},
        labelEnum: [
          { value: 'red', label: 'Red' },
          { value: 'blue', label: 'Blue' },
          { value: 'green', label: 'Green' },
        ],
      })
    ).toMatchObject({
      type: 'string',
      label: 'Color',
      enumMatch: 'exact',
      description: 'a couple of words',
      enum: ['red', 'blue', 'green'],
      enumLabel: ['Red', 'Blue', 'Green'],
    })
  })

  it('tests a records validity on import', () => {
    expect(compileToJsonSchema(ddlSchema)).toMatchObject(jsonSchema)
  })

  it('tests full compile of enum ', () => {
    const ddlSchema: SchemaILModel = {
      fields: {
        color: {
          field: 'color',
          label: 'Color',
          matchStrategy: 'exact',
          type: 'enum',
          annotations: {},
          labelEnum: [
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' },
          ],
          required: false,
        },
      },
      name: 'testSchema',
      slug: 'test',
      namespace: 'testspace',
      allowCustomFields: false,
    }

    const jsonSchema: IJsonSchema = {
      properties: {
        color: {
          type: 'string',
          label: 'Color',
          field: 'color',
          enumMatch: 'exact',
          enum: ['red', 'blue', 'green'],
          enumLabel: ['Red', 'Blue', 'Green'],
        },
      },
      type: 'object',
      required: [],
      unique: [],
      //primary: 'id',
      allowCustomFields: false,
    }

    expect(compileToJsonSchema(ddlSchema)).toMatchObject(jsonSchema)
  })

  it('tests a linkedField properly compiles', () => {
    const linkedFieldSchema: SchemaILModel = {
      fields: {
        linkedFieldKey: {
          type: 'schema_ref',
          sheetName: 'foo',
          label: 'linked_field_label',
          field: 'linked_field__field_name',
          upsert: true,
          annotations: {},
        },
      },
      name: 'linkedFieldSheet',
      slug: 'lfs',
      namespace: 'testspace',
      allowCustomFields: false,
    }

    expect(SchemaILToJsonSchema(linkedFieldSchema)).toMatchObject({
      allowCustomFields: false,
      primary: undefined,
      properties: {
        linkedFieldKey: {
          $schemaId: 'foo',
          field: 'linkedFieldKey',
          label: 'linked_field_label',
          type: 'schema_ref',
          upsert: undefined,
          visibility: undefined,
        },
      },
      required: [],
      type: 'object',
      unique: [],
    })
  })

  it('tests a linkedField upsert:False properly compiles', () => {
    const linkedFieldSchema: SchemaILModel = {
      fields: {
        linkedFieldKey: {
          type: 'schema_ref',
          sheetName: 'foo',
          label: 'linked_field_label',
          field: 'linked_field__field_name',
          upsert: false,
          annotations: {},
        },
      },
      name: 'linkedFieldSheet',
      slug: 'lfs',
      namespace: 'testspace',
      allowCustomFields: false,
    }

    expect(SchemaILToJsonSchema(linkedFieldSchema)).toMatchObject({
      allowCustomFields: false,
      primary: undefined,
      properties: {
        linkedFieldKey: {
          $schemaId: 'foo',
          field: 'linkedFieldKey',
          label: 'linked_field_label',
          type: 'schema_ref',
          upsert: false,
          visibility: undefined,
        },
      },
      required: [],
      type: 'object',
      unique: [],
    })
  })

  it('tests no allowCustomFields', () => {
    const noCustom: SchemaILModel = {
      fields: {
        first_name: {
          type: 'string',
          label: 'First Name',
          required: true,
          annotations: {},
          field: 'first_name',
        },
      },
      name: 'testSchema',
      slug: 'test',
      namespace: 'testspace',
      allowCustomFields: false,
    }

    const noCustomJSS: IJsonSchema = {
      properties: {
        first_name: {
          type: 'string',
          label: 'First Name',
          field: 'first_name',
        },
      },
      type: 'object',
      allowCustomFields: false,
    }
    expect(compileToJsonSchema(noCustom)).toMatchObject(noCustomJSS)
  })
  it('tests allowCustomFields', () => {
    const withCustom: SchemaILModel = {
      fields: {
        first_name: {
          type: 'string',
          label: 'First Name',
          required: true,
          annotations: {},
          field: 'first_name',
        },
      },
      name: 'testSchema',
      slug: 'test',
      namespace: 'testspace',
      allowCustomFields: true,
    }

    const withCustomJSS: IJsonSchema = {
      properties: {
        first_name: {
          type: 'string',
          label: 'First Name',
          field: 'first_name',
        },
      },
      type: 'object',
      allowCustomFields: true,
    }
    expect(compileToJsonSchema(withCustom)).toMatchObject(withCustomJSS)
  })
  it('tests descriptions', () => {
    const withCustom: SchemaILModel = {
      fields: {
        first_name: {
          type: 'string',
          label: 'First Name',
          description: 'foo',
          required: true,
          annotations: {},
          field: 'first_name',
        },
      },
      name: 'testSchema',
      slug: 'test',
      namespace: 'testspace',
      allowCustomFields: true,
    }
    const withCustomJSS: IJsonSchema = {
      properties: {
        first_name: {
          type: 'string',
          description: 'foo',
          label: 'First Name',
          field: 'first_name',
        },
      },
      type: 'object',
      allowCustomFields: true,
    }
    expect(compileToJsonSchema(withCustom)).toMatchObject(withCustomJSS)
  })
})
