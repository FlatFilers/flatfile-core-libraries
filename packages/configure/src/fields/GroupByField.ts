import { TextField } from './TextField'

export const GroupByField = (groupByField: string[], expression: any) => {
  const retField = TextField()
  retField.options.getSheetCompute = (fieldName: string) => {
    return [
      'groupByCompute',
      {
        groupBy: groupByField,
        expression: expression,
        destination: fieldName,
      },
      ['variable', 'sheet'],
      ['variable', 'modifiedRecords'],
    ]
  }
  return retField
}
