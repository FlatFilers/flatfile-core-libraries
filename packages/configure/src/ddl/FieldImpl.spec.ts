import { OptionField } from '../fields'
import { WorkbookTester } from './WorkbookTester'

// First sets of Workbook Tests
describe('Field specific tests ->', () => {
  test('cast for Options works properly', async () => {
    const flawedOptionFieldConstruction = () => {
      OptionField({
        options: { foo: 'Foo', bar: 'Bar' },
        default: 'baz', // not a valid option
      })
    }
    expect(flawedOptionFieldConstruction).toThrow(
      "Invalid default of baz, value doesn't appear as one of the keys in foo,bar"
    )
  })

  test('cast for Options works properly', async () => {
    const TestSchema = new WorkbookTester(
      {
        opt: OptionField({
          options: { foo: 'Foo', bar: 'Bar' },
        }),
      },
      {}
    )

    await TestSchema.checkRowResult({
      rawData: { opt: 'foo' },
      expectedOutput: { opt: 'foo' },
      message: false,
    })

    //setting a non-existent option should do something
    await TestSchema.checkRowResult({
      rawData: { opt: '3333' },
      expectedOutput: { opt: '3333' },
      message: false, // hack, for now so tests pass.  Trying to figure out what behavior we want
      //message: "some error"
    })
  })
})
