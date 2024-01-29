import { SchemaILField, SchemaILModel } from './types/SchemaIL'
import {
  EnumProperty,
  NumberProperty,
  SheetConfig,
  StringProperty,
} from '@flatfile/blueprint'

import {
  SchemaILFieldtoProperty,
  SchemaILModelToSheetConfig,
} from './BlueprintConvert'

describe('compiler tests', () => {
  it('checks compiling a string', () => {
    const stringField: SchemaILField = {
      type: 'string',
      label: 'First Name',
      description: 'A Description of a nice First Name',
      required: true,
      readonly: true,
      annotations: {},
      field: 'first_name',
      blueprint: {
        metadata: {
          foo: 'bar',
        },
      },
    }

    const blueprintOutput: StringProperty = {
      type: 'string',
      label: 'First Name',
      description: 'A Description of a nice First Name',
      key: 'first_name',
      readonly: true,
      constraints: [{ type: 'required' }],
      metadata: {
        foo: 'bar',
      },
    }
    expect(SchemaILFieldtoProperty(stringField)).toStrictEqual(blueprintOutput)
  })

  it('checks compiling an enum', () => {
    const enumField: SchemaILField = {
      type: 'enum',
      matchStrategy: 'fuzzy',
      label: 'Department',
      required: true,
      annotations: {},
      field: 'department',
      labelEnum: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'ops', label: 'Human Resources' },
      ],
    }

    const blueprintOutput: EnumProperty = {
      type: 'enum',
      key: 'department',
      label: 'Department',
      description: undefined,
      readonly: false,
      constraints: [{ type: 'required' }],
      config: {
        options: [
          {
            value: 'engineering',
            label: 'Engineering',
          },
          {
            value: 'ops',
            label: 'Human Resources',
          },
        ],
      },
    }

    expect(SchemaILFieldtoProperty(enumField)).toStrictEqual(blueprintOutput)
  })

  it('checks compiling an enum with booleans', () => {
    const enumField: SchemaILField = {
      type: 'enum',
      matchStrategy: 'fuzzy',
      label: 'spanishTrue',
      required: true,
      annotations: {},
      field: 'spanishTrue',
      labelEnum: [
        { value: true, label: 'si' },
        { value: false, label: 'ney' },
      ],
    }

    const blueprintOutput: EnumProperty = {
      type: 'enum',
      key: 'spanishTrue',
      label: 'spanishTrue',
      description: undefined,
      readonly: false,
      constraints: [{ type: 'required' }],
      config: {
        options: [
          {
            value: true,
            label: 'si',
          },
          {
            value: false,
            label: 'ney',
          },
        ],
      },
    }

    expect(SchemaILFieldtoProperty(enumField)).toStrictEqual(blueprintOutput)
  })

  it('checks compiling a number', () => {
    const numberField: SchemaILField = {
      type: 'number',
      label: 'Salary',
      required: true,
      annotations: {},
      field: 'salary',
    }

    const blueprintOutput: NumberProperty = {
      type: 'number',
      key: 'salary',
      label: 'Salary',
      description: undefined,
      readonly: false,
      constraints: [{ type: 'required' }],
    }

    expect(SchemaILFieldtoProperty(numberField)).toStrictEqual(blueprintOutput)
  })

  it('checks stageVisibility compiles for X number', () => {
    const numberField: SchemaILField = {
      type: 'number',
      label: 'Salary',
      annotations: {},
      field: 'salary',
      stageVisibility: { mapping: false },
    }

    const blueprintOutput: NumberProperty = {
      type: 'number',
      key: 'salary',
      label: 'Salary',
      description: undefined,
      readonly: false,
      constraints: [{ type: 'computed' }],
    }

    expect(SchemaILFieldtoProperty(numberField)).toStrictEqual(blueprintOutput)
  })
})

describe('compiler tests', () => {
  const simpleSheetConfig: SheetConfig = {
    name: 'foo',
    readonly: true,
    fields: [
      {
        type: 'number',
        key: 'salary',
        label: 'Salary',
        constraints: [{ type: 'required' }],
      },
    ],
  }

  const simpleDdlSchema: SchemaILModel = {
    fields: {
      salary: {
        type: 'number',
        label: 'Salary',
        required: true,
        annotations: {},
        field: 'salary',
      },
    },
    name: 'foo',
    allowCustomFields: false,
    readonly: true,
    slug: 'test',
    namespace: 'testspace',
  }

  it('checks compiling a simple SchemaILModel ', () => {
    expect(SchemaILModelToSheetConfig(simpleDdlSchema)).toMatchObject(
      simpleSheetConfig
    )
  })

  const complexSheetConfig: SheetConfig = {
    name: 'foo',
    fields: [
      {
        type: 'number',
        key: 'salary',
        label: 'Salary',
        constraints: [{ type: 'required' }],
      },
      {
        type: 'enum',
        key: 'department',
        label: 'Department',
        constraints: [{ type: 'required' }],
        config: {
          options: [
            {
              value: 'engineering',
              label: 'Engineering',
            },
            {
              value: 'ops',
              label: 'Human Resources',
            },
          ],
        },
      },
    ],
  }

  const complexDdlSchema: SchemaILModel = {
    fields: {
      salary: {
        type: 'number',
        label: 'Salary',
        required: true,
        annotations: {},
        field: 'salary',
      },
      department: {
        type: 'enum',
        matchStrategy: 'fuzzy',
        label: 'Department',
        required: true,
        annotations: {},
        field: 'department',
        labelEnum: [
          { value: 'engineering', label: 'Engineering' },
          { value: 'ops', label: 'Human Resources' },
        ],
      },
    },
    name: 'foo',
    allowCustomFields: false,
    slug: 'test',
    namespace: 'testspace',
  }

  it('checks compiling a more complex SchemaILModel ', () => {
    expect(SchemaILModelToSheetConfig(complexDdlSchema)).toMatchObject(
      complexSheetConfig
    )
  })
})
