import { NumberField, DateField } from '../fields'
import { WorkbookTester } from './WorkbookTester'

describe('EgressFormatTests ->', () => {
  test('simple egress works ', async () => {
    const TestSchema = new WorkbookTester(
      { b: NumberField({ egressFormat: (val: number) => `${val}` }) },
      {}
    )

    await TestSchema.checkRowResult({
      rawData: { b: '20' },
      expectedOutput: { b: '20' },
    })
  })
  const ef20Improper = (val: number) => {
    if (val === 20) {
      return '30'
    }
    return `${val}`
  }
  test('improper egress at compute prevents change to record egress works ', async () => {
    const TestSchema = new WorkbookTester(
      { b: NumberField({ egressFormat: ef20Improper }) },
      {}
    )

    await TestSchema.checkRowResult({
      rawData: { b: '20' }, //egress format will try to return 30, but this will fail verifyEgressCycle, test that '20' is still saved
      expectedOutput: { b: '20' },
      message:
        "Error: There was an error when processing value '20'. The result was '30', which constitutes a loss of data. If '30' is the correct result, you can fix this error by entering '30' into this cell.",
    })

    await TestSchema.checkRowResult({
      rawData: { b: '21' },
      expectedOutput: { b: '21' },
    })
  })

  test('improper egress at compute is ignored when allowDataLoss option is set', async () => {
    const TestSchema = new WorkbookTester(
      { b: NumberField({ egressFormat: ef20Improper, allowDataLoss: true }) },
      {}
    )

    await TestSchema.checkRowResult({
      rawData: { b: '20' },
      expectedOutput: { b: '30' },
      message: false,
    })

    await TestSchema.checkRowResult({
      rawData: { b: '21' },
      expectedOutput: { b: '21' },
    })
  })

  const ef20Error = (val: number) => {
    if (val === 20) {
      throw new Error('egress failure')
    }
    return `${val}`
  }
  test('error egress at compute prevents change to record egress works ', async () => {
    const TestSchema = new WorkbookTester(
      { b: NumberField({ egressFormat: ef20Error }) },
      {}
    )

    await TestSchema.checkRowResult({
      // egress format will try to return 30, but this will fail verifyEgressCycle, test that '20' is still saved
      rawData: { b: '20' },
      expectedOutput: { b: '20' },
      message:
        'Error: There was an error when processing value 20. The field threw an error when trying to write the final value to the cell.',
    })

    await TestSchema.checkRowResult({
      rawData: { b: '21' },
      expectedOutput: { b: '21' },
    })
  })

  test('verify that dates can egress  ', async () => {
    const TestSchema = new WorkbookTester(
      { b: DateField({ egressFormat: (val: Date) => `${val}` }) },
      {}
    )

    //expectedEgress will look something like "Sat Sep 19 2009 20:00:00 GMT-0400 (Eastern Daylight Time)" note the included timezone, this egress will be different when run in different timezones, so we need to fix it here... This stuff is why dates and egress need to be thought of carefully
    const expectedEgress = `${new Date('2009-09-20')}`
    await TestSchema.checkRowResult({
      rawData: { b: '2009-09-20' },
      expectedOutput: { b: expectedEgress },
    })
  })

  test('verify that dates can egress test 2', async () => {
    const TestSchema = new WorkbookTester(
      {
        b: DateField({
          egressFormat: (val: Date) =>
            `${val.getUTCFullYear()}-${
              val.getUTCMonth() + 1
            }-${val.getUTCDate()}`,
        }),
      },
      {}
    )

    await TestSchema.checkRowResult({
      rawData: { b: '2009-10-20' },
      expectedOutput: { b: '2009-10-20' },
      message: false,
    })
  })
})
