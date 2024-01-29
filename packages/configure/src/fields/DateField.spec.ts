import { DateField } from './DateField'
import { WorkbookTester } from '../ddl/WorkbookTester'

describe('DateField tests ->', () => {
  test('passing a date with default egress format works', async () => {
    const TestWorkbook = new WorkbookTester({ hiredOn: DateField() }, {})

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: '4/1/2019' },
      expectedOutput: { hiredOn: '4/1/2019' },
      message: false,
    })

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: '15 Oct 2006' },
      expectedOutput: { hiredOn: '10/15/2006' },
      message: false,
    })

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: 'March 1 2008' },
      expectedOutput: { hiredOn: '3/1/2008' },
      message: false,
    })
  })

  test('passing a date with a custom egress format works', async () => {
    const TestWorkbook = new WorkbookTester(
      {
        hiredOn: DateField({
          egressFormat: (v: Date) => {
            return `${v.getMonth() + 1}-${v.getDate()}-${v.getFullYear()}`
          },
        }),
      },
      {}
    )

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: '4/1/2019' },
      expectedOutput: { hiredOn: '4-1-2019' },
      message: false,
    })

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: '15 Oct 2006' },
      expectedOutput: { hiredOn: '10-15-2006' },
      message: false,
    })

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: 'March 1 2008' },
      expectedOutput: { hiredOn: '3-1-2008' },
      message: false,
    })
  })

  test('passing something that is not a date throws an error and leaves the value unchanged', async () => {
    const TestWorkbook = new WorkbookTester({ hiredOn: DateField() }, {})

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: 'hello' },
      expectedOutput: { hiredOn: 'hello' },
      message: `Error: Value could not be interpreted as a date.`,
    })

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: '12041992' },
      expectedOutput: { hiredOn: '12041992' },
      message: `Error: Value could not be interpreted as a date.`,
    })
  })

  test('passing null returns null with no error', async () => {
    const TestWorkbook = new WorkbookTester({ hiredOn: DateField() }, {})

    await TestWorkbook.checkRowResult({
      rawData: { hiredOn: null },
      expectedOutput: { hiredOn: null },
      message: false,
    })
  })
})
