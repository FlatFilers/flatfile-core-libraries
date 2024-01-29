import fetch from 'node-fetch'
import { TextField, NumberField } from '../fields'
import { Message } from './Field'
import { WorkbookTester } from './WorkbookTester'
import { FlatfileRecord } from '@flatfile/hooks'

/*
  This test file is supposed to look like a traditional jest test, it is used for developers of the SchemaIL, FlatfileDDL, and Hook runtimes.

  More compact demonstrative tests live in other files

  */

const BaseFieldArgs = {
  required: true,
  description: 'This is a Number Field',
}

// First sets of Workbook Tests
describe('Functional Hook Tests ->', () => {
  test('Sending rows with duplicates in multiple columns returns duplicates location', async () => {
    const TestSchema = new WorkbookTester(
      {
        a: NumberField({ ...BaseFieldArgs, unique: true }),
        b: NumberField({ ...BaseFieldArgs, unique: true, required: true }),
        c: NumberField({
          ...BaseFieldArgs,
          unique: true,
          validate: (v: number) => {
            if (v > 100) {
              throw 'too big'
            }
          },
        }),
      },
      {}
    )

    const dataWithDuplicates = [
      { a: 1, b: null, c: 100 },
      { a: 1, b: 3, c: 100 },
      { a: null, b: 8, c: 100 },
      { a: 2, b: 9, c: 100 },
      { a: 1, b: 3, c: 300 },
      { a: null, b: 4, c: 301 },
    ]

    const expectedDuplicates = { a: [1, 2, 5], b: [2, 5], c: [1, 2, 3, 4] }

    expect(
      await TestSchema.checkForDuplicates(dataWithDuplicates)
    ).toStrictEqual(expectedDuplicates)
  })

  test('Sending data without duplicates returns null', async () => {
    const TestSchema = new WorkbookTester(
      {
        a: NumberField({ ...BaseFieldArgs, unique: true }),
        b: NumberField({ ...BaseFieldArgs, required: true }),
        c: NumberField({
          ...BaseFieldArgs,
          validate: (v: number) => {
            if (v > 100) {
              throw 'too big'
            }
          },
        }),
      },
      {}
    )

    const dataWithDuplicates = [
      { a: 1, b: null, c: 100 },
      { a: 2, b: 3, c: 100 },
      { a: '', b: undefined, c: 100 },
      { a: 4, b: '', c: 100 },
      { a: 5, b: 3, c: 300 },
    ]

    const expectedDuplicates = null

    expect(await TestSchema.checkForDuplicates(dataWithDuplicates)).toBe(
      expectedDuplicates
    )
  })
  test('validate() can return messages ', async () => {
    const TestSchema = new WorkbookTester(
      {
        salary: NumberField({
          validate: (salary: number) => {
            const minSalary = 30_000
            if (salary < minSalary) {
              return [
                new Message(
                  `${salary} is less than minimum wage ${minSalary}`,
                  'warn',
                  'validate'
                ),
              ]
            }
          },
        }),
      },
      {}
    )
    const rawData = { salary: '25,000' }
    const expectedOutput = { salary: 25_000 }

    await TestSchema.checkRowResult({
      rawData,
      expectedOutput,
      message: '25000 is less than minimum wage 30000',
    })
  })
  test('cast() + compute() + validate() + recordCompute() expected output is correct', async () => {
    const rawData = { firstNumber: '99' }
    const expectedOutput = { firstNumber: 202 }
    const TestSchema = new WorkbookTester(
      {
        firstNumber: NumberField({
          ...BaseFieldArgs,
          cast: (v: any) => {
            if (isNaN(Number(v))) {
              return 0
            }

            return Number(v)
          },
          compute: (v: number) => v + 2,
          validate: (v: number) => {
            if (v > 100) {
              throw 'too big'
            }
          },
        }),
      },
      {
        recordCompute: (record: any) => {
          const firstNumber = record.get('firstNumber')
          record.set('firstNumber', firstNumber * 2)
        },
      }
    )

    await TestSchema.checkRowResult({
      rawData,
      expectedOutput,
      message: 'too big',
    })
  })

  test('cast() + compute() + validate() + recordCompute() expected output is correct', async () => {
    const rawData = { firstNumber: '99' }
    const expectedOutput = { firstNumber: 202 }
    const TestSchema = new WorkbookTester(
      {
        firstNumber: NumberField({
          ...BaseFieldArgs,
          cast: (v: any) => {
            if (isNaN(Number(v))) {
              return 0
            }

            return Number(v)
          },
          compute: (v: number) => v + 2,
          validate: (v: number) => {
            if (v > 100) {
              throw 'too big'
            }
          },
        }),
      },
      {
        recordCompute: (record: any) => {
          const firstNumber = record.get('firstNumber')
          record.set('firstNumber', firstNumber * 2)
        },
      }
    )

    await TestSchema.checkRowResult({
      rawData,
      expectedOutput,
      message: 'too big',
    })
  })

  test('cast() + validate() isnt called with a null', async () => {
    const rawData = { firstNumber: '99' }
    const expectedOutput = { firstNumber: 202 }
    const TestSchema = new WorkbookTester(
      {
        a: TextField({
          validate: (v: any) => {
            throw 'should never see'
          },
        }),
      },
      {}
    )

    await TestSchema.checkRowResult({
      rawData: { a: null },
      expectedOutput: { a: null },
      // how do I assert nothing is thrown
      message: false,
    })
  })

  test(' batchRecordsCompute() expected output is correct', async () => {
    const rawData = { firstNumber: '99' }
    const expectedOutput = { firstNumber: 202 }
    const TestSchema = new WorkbookTester(
      {
        from_http: TextField({}),
      },
      {
        batchRecordsCompute: async (records: any) => {
          const response = await fetch('https://api.us.flatfile.io/health', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          })
          const result = (await response.json()) as any
          records.records.map(async (record: FlatfileRecord) => {
            record.set('from_http', result.info.postgres.status)
          })
        },
      }
    )

    await TestSchema.checkRowResult({
      rawData: { from_http: 'foo' },
      expectedOutput: { from_http: 'up' },
    })
  })

  test('annotations work ', async () => {
    const TestSchema = new WorkbookTester(
      {
        a: TextField({
          default: 'asdf',
          annotations: { default: true, compute: true },
          compute: (v: string) => v.toLowerCase(),
        }),
        b: NumberField({
          default: 0,
          annotations: { default: true, compute: true },
          compute: (v: number) => v + 2,
        }),
      },
      {}
    )

    await TestSchema.checkRowResult({
      rawData: { a: null, b: null },
      expectedOutput: { a: 'asdf', b: 2 },
      message: "This field was automatically given a default value of 'asdf'",
    })

    await TestSchema.checkRowResult({
      rawData: { a: 'ASDF', b: '2' },
      expectedOutput: { a: 'asdf' },
      message:
        "This value was automatically reformatted - original data: 'ASDF'",
    })
  })
})
