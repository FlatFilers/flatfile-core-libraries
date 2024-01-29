import { NumberField, OptionField, TextField, LinkedField } from '../fields'
import { Message } from './Field'
import { Sheet } from './Sheet'
describe('BaseField', () => {
  beforeAll(() => {
    jest.mock('node-fetch', () => jest.fn())
  })
  describe('NumberField tests ->', () => {
    test('toSchemaIL works', () => {
      expect(NumberField({}).toSchemaILField('a_number_field')).toMatchObject({
        description: '',
        field: 'a_number_field',
        label: 'a_number_field',
        primary: false,
        required: false,
        type: 'number',
        unique: false,
      })
      expect(
        NumberField({ required: true }).toSchemaILField('a_number_field')
      ).toMatchObject({
        description: '',
        field: 'a_number_field',
        label: 'a_number_field',
        primary: false,
        required: true,
        type: 'number',
        unique: false,
      })
    })

    test('computeToValue works', () => {
      const nf = NumberField({})

      expect(nf.computeToValue(undefined)).toStrictEqual([null, []])
      const nf2 = NumberField({
        cast: (val: any) => {
          throw new Error('err')
        },
      })
      const m = new Message('Error: err', 'error', 'cast')
      expect(nf2.computeToValue(undefined)).toStrictEqual([undefined, [m]])
    })
  })

  describe('OptionField tests ->', () => {
    test('toSchemaIL works', () => {
      expect(
        OptionField({
          label: 'Custom Label',
          options: { foo: 'Foo', bar: 'Display label for bar' },
        }).toSchemaILField('option_field')
      ).toMatchObject({
        description: '',
        field: 'option_field',
        label: 'Custom Label',
        matchStrategy: 'fuzzy',
        primary: false,
        required: false,
        labelEnum: [
          { value: 'foo', label: 'Foo' },
          { value: 'bar', label: 'Display label for bar' },
        ],
        type: 'enum',
        unique: false,
      })
    })

    test('toSchemaIL works with booleans', () => {
      expect(
        OptionField({
          label: 'Plan type',
          options: {
            premium: 'Premium',
            standard: 'Standard',
            none: { value: false, label: 'None' },
          },
        }).toSchemaILField('option_field')
      ).toMatchObject({
        description: '',
        field: 'option_field',
        label: 'Plan type',
        matchStrategy: 'fuzzy',
        primary: false,
        required: false,
        labelEnum: [
          { value: 'premium', label: 'Premium' },
          { value: 'standard', label: 'Standard' },
          { value: false, label: 'None' },
        ],
        type: 'enum',
        unique: false,
      })
    })

    test('enumMatchStrategy exact works', () => {
      expect(
        OptionField({
          label: 'Custom Label',
          matchStrategy: 'exact',
          options: { foo: 'Foo', bar: 'Display label for bar' },
        }).toSchemaILField('option_field')
      ).toMatchObject({
        description: '',
        field: 'option_field',
        label: 'Custom Label',
        matchStrategy: 'exact',
        primary: false,
        required: false,
        labelEnum: [
          { value: 'foo', label: 'Foo' },
          { value: 'bar', label: 'Display label for bar' },
        ],
        type: 'enum',
        unique: false,
      })
    })
    test('matchStrategy exact emits proper JSONSchema', () => {
      const OptionsEnumMatchStrat = new Sheet(
        'OptionsEnumMatchStrat',
        {
          selectOptions: OptionField({
            label: 'Lots of options',
            description: 'Select from a list of options',
            matchStrategy: 'exact',
            options: {
              red: 'Red Thing',
              blue: { label: 'Blue Label' },
              orange: { label: 'Orange peel' },
              green: { label: 'Green is the best' },
            },
          }),
        },
        {}
      )
      expect(OptionsEnumMatchStrat.toJSONSchema('foo', 'bar')).toMatchObject({
        allowCustomFields: false,
        primary: undefined,
        properties: {
          selectOptions: {
            enumMatch: 'exact',
            enum: ['red', 'blue', 'orange', 'green'],
            enumLabel: [
              'Red Thing',
              'Blue Label',
              'Orange peel',
              'Green is the best',
            ],
            field: 'selectOptions',
            label: 'Lots of options',
            type: 'string',
            visibility: undefined,
          },
        },
        required: [],
        type: 'object',
        unique: [],
      })
    })
  })

  describe('LinkedField tests ->', () => {
    test('toSchemaIL works', () => {
      const BaseTemplate = new Sheet(
        'BaseTemplate',
        {
          firstName: TextField({
            unique: true,
            primary: true,
          }),
          middleName: TextField('Middle'),
          lastName: TextField(),
        },
        {
          previewFieldKey: 'middleName',
        }
      )

      expect(
        LinkedField({
          label: 'Custom Label',
          sheet: BaseTemplate,
        }).toSchemaILField('linked_field')
      ).toMatchObject({
        description: '',
        field: 'linked_field',
        label: 'Custom Label',
        primary: false,
        required: false,
        type: 'schema_ref',
        sheetName: 'BaseTemplate',
        upsert: true,
        unique: false,
      })
    })

    test('toSchemaIL upsert:False works', () => {
      const BaseTemplate = new Sheet(
        'BaseTemplate',
        {
          firstName: TextField({
            unique: true,
            primary: true,
          }),
          middleName: TextField('Middle'),
          lastName: TextField(),
        },
        {
          previewFieldKey: 'middleName',
        }
      )

      expect(
        LinkedField({
          label: 'Custom Label',
          sheet: BaseTemplate,
          upsert: false,
        }).toSchemaILField('linked_field')
      ).toMatchObject({
        description: '',
        field: 'linked_field',
        label: 'Custom Label',
        primary: false,
        required: false,
        type: 'schema_ref',
        sheetName: 'BaseTemplate',
        upsert: false,
        unique: false,
      })
    })
    test('linkedField without a sheet throws an error', () => {
      const badFunc = () =>
        // missing a sheet, should be a typing error
        //@ts-expect-error
        LinkedField({
          label: 'Custom Label',
          upsert: false,
        })
    })
  })
})
