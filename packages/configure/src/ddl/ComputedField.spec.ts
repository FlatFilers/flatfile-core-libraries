import { NumberField, TextField } from '@flatfile/configure'
import { ComputedField } from './ComputedField'
import { WorkbookTester } from './WorkbookTester'
import { TPrimitive } from '@flatfile/hooks'

// First sets of Workbook Tests
describe('computedFiled ->', () => {
  test('ComputedField can be instantiated ', async () => {
    ComputedField(NumberField({ required: false }), {
      dependsOn: ['a', 'b'],
      compute: (rec: Record<string, TPrimitive>) => {
        const a = rec['a'] as number
        const b = rec['b'] as number
        if (typeof a === 'number' && typeof b === 'number') {
          return a + b
        } else {
          throw new Error('wrong types provided')
        }
      },
      destination: 'c',
    })
  })
  test('computedField works', async () => {
    const TestSchema = new WorkbookTester(
      {
        a: NumberField({}),
        b: NumberField({}),
        c: ComputedField(NumberField({ required: false }), {
          dependsOn: ['a', 'b'],
          compute: (rec: Record<string, TPrimitive>) => {
            const a = rec['a'] as number
            const b = rec['b'] as number
            if (typeof a === 'number' && typeof b === 'number') {
              return a + b
            } else {
              throw new Error('wrong types provided')
            }
          },
          destination: 'c',
        }),
      },
      {}
    )
    const rawData = { a: 1, b: 2, c: null }
    const expectedOutput = { a: 1, b: 2, c: 3 }

    await TestSchema.checkRowResult({
      rawData,
      expectedOutput,
    })
  })

  test('computedField deals with errors explictly thrown from compute function', async () => {
    const TestSchema = new WorkbookTester(
      {
        a: NumberField({}),
        b: NumberField({}),
        c: ComputedField(NumberField({ required: false }), {
          dependsOn: ['a', 'b'],
          compute: (rec: Record<string, TPrimitive>) => {
            /*   The following line is the error, should we throw here on accessing rec['non-existent-field'] or at wrong types provided */
            const a = rec['non-existent-field'] as number
            const b = rec['b'] as number

            if (typeof a === 'number' && typeof b === 'number') {
              return a + b
            } else {
              throw new Error('wrong types provided')
            }
          },
          destination: 'c',
        }),
      },
      {}
    )
    const rawData = { a: 1, b: 2, c: null }
    const expectedOutput = { a: 1, b: 2, c: null }

    await TestSchema.checkRowResult({
      rawData,
      expectedOutput,
      //TODO add extra checks to see that this error occurs on the 'c'
      //field, and that it is somehow denoted as an error of the
      //computedField compute function
      message: 'Error: wrong types provided',
    })
  })
  test('computedField deals with runtime errors', async () => {
    const TestSchema = new WorkbookTester(
      {
        a: NumberField({}),
        b: NumberField({}),
        c: ComputedField(NumberField({ required: false }), {
          dependsOn: ['a', 'b'],
          compute: (rec: Record<string, TPrimitive>) => {
            // The following line is the error, should we throw here
            // on accessing rec['non-existent-field'] or at wrong
            // types provided
            const a = rec['non-existent-field'] as number
            return a.toString()
          },
          destination: 'c',
        }),
      },
      {}
    )
    const rawData = { a: 1, b: 2, c: null }
    const expectedOutput = { a: 1, b: 2, c: null }

    await TestSchema.checkRowResult({
      rawData,
      expectedOutput,
      //TODO add extra checks to see that this error occurs on the 'c'
      //field, and that it is somehow denoted as an error of the
      //computedField compute function
      message:
        "TypeError: Cannot read properties of undefined (reading 'toString')",
    })
  })
  test("computedField throws an error when a depends on field isn't provided", async () => {
    const TestSchema = new WorkbookTester(
      {
        a: NumberField({}),
        b: NumberField({}),
        c: ComputedField(NumberField({ required: false }), {
          dependsOn: ['a', 'b'],
          compute: (rec: Record<string, TPrimitive>) => {
            // note, this function would fill in c, but it shouldn't
            // be called becasue the `dependsOn` requirement wasn't
            // met
            return 5
          },
          destination: 'c',
        }),
      },
      {}
    )
    const rawData = { a: 1, b: null, c: null }
    const expectedOutput = { a: 1, b: null, c: null }

    await TestSchema.checkRowResult({
      rawData,
      expectedOutput,
      //TODO add extra checks for multiple dependsOn fields that aren't present
      message:
        "This field depends on field b, which has a value of 'null'. Please provide a non-empty value for b.",
    })
  })

  test('computedField also works with possiblyDependsOn', async () => {
    const TestSchema = new WorkbookTester(
      {
        a: NumberField({}),
        b: NumberField({}),
        c: ComputedField(TextField({ required: false }), {
          dependsOn: ['a'],
          possiblyDependsOn: ['b'],

          compute: (rec: Record<string, TPrimitive>) => {
            if (rec['b'] === null) {
              return "b wasn't there"
            } else {
              return 'a and b present'
            }
          },
          destination: 'c',
        }),
      },
      {}
    )
    await TestSchema.checkRowResult({
      rawData: { a: 1, b: null, c: '' },
      expectedOutput: { a: 1, b: null, c: "b wasn't there" },
    })
    await TestSchema.checkRowResult({
      rawData: { a: 1, b: 6, c: '' },
      expectedOutput: { a: 1, b: 6, c: 'a and b present' },
    })
  })
})
