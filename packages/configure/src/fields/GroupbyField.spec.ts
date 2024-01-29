import { TextField, Sheet } from '@flatfile/configure'
import { GroupByField } from './GroupByField'

// First sets of Workbook Tests
describe('GroupbyField ->', () => {
  test('GroupByField can be instantiated ', async () => {
    GroupByField(['country'], ['count', ['variable', 'group']])
  })
  test('GroupByField works', async () => {
    const testSheet = new Sheet(
      'testSheet',
      {
        a: TextField({}),
        b: GroupByField(['a'], ['count', ['variable', 'group']]),
      },
      {}
    )

    expect(testSheet.getSheetCompute()).toMatchObject({
      sheetCompute: [
        'groupByCompute',
        {
          groupBy: ['a'],
          expression: ['count', ['variable', 'group']],
          destination: 'b',
        },
        ['variable', 'sheet'],
        ['variable', 'modifiedRecords'],
      ],
    })
  })
})
