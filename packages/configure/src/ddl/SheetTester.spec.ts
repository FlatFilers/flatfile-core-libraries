import { BooleanField, NumberField, TextField } from '../fields/'
import { Sheet } from './Sheet'
import { SheetTester } from './SheetTester'
import { Workbook } from './Workbook'

const TestSheet = new Sheet(
  'TestSheet',
  {
    firstName: TextField({
      required: true,
      description: 'foo',
      compute: (v: string) => v.toUpperCase(),
    }),
    age: NumberField(),
    testBoolean: BooleanField({ default: false }),
  },
  {
    recordCompute: (record, _session, _logger) => {
      const age = record.get('age')
      const newAge = typeof age === 'number' ? age * 2 : 0
      record.set('age', newAge)
    },
  }
)

const TestWorkbook = new Workbook({
  name: `Test Workbook`,
  namespace: 'test',
  sheets: { TestSheet },
})

describe('Workbook tests ->', () => {
  const testSheet = new SheetTester(TestWorkbook, 'TestSheet')

  test('Single Record works', async () => {
    const inputRow = { firstName: 'foo', age: '10', testBoolean: 'true' }

    const expectedOutputRow = { age: 20, firstName: 'FOO', testBoolean: true }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Multiple Records work', async () => {
    const inputRows = [
      { firstName: 'foo', age: '10', testBoolean: 'true' },
      { firstName: 'bar', age: '8', testBoolean: 'true' },
    ]

    const expectedOutputRows = [
      { age: 20, firstName: 'FOO', testBoolean: true },
      { age: 16, firstName: 'BAR', testBoolean: true },
    ]

    const results = await testSheet.testRecords(inputRows)
    expect(results).toMatchObject(expectedOutputRows)
  })

  test('transformField() work', async () => {
    expect(await testSheet.transformField('firstName', 'alex')).toEqual('ALEX')
    expect(await testSheet.transformField('age', '10')).toEqual(20)
    expect(await testSheet.transformField('testBoolean', 'true')).toEqual(true)
  })

  test('Testing records with fields that do not exist on the sheet throws an error', async () => {
    const inputRows = [
      {
        firstName: 'foo',
        age: '10',
        testBoolean: 'true',
        nonExistentField: 'oops',
      },
    ]
    expect.assertions(2)
    try {
      await testSheet.testRecord(inputRows[0])
    } catch (e) {
      expect(e).toEqual(
        new Error(
          'Attempted to process record with field nonExistentField which does not exist on sheet TestSheet'
        )
      )
    }
    try {
      await testSheet.transformField('nonExistentField', 'alex')
    } catch (e) {
      expect(e).toEqual(
        new Error(
          'Attempted to process record with field nonExistentField which does not exist on sheet TestSheet'
        )
      )
    }
  })
})
