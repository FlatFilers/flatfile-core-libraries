import type { FieldConfig } from '@flatfile/configure'
import type { FlatfileRecord } from '@flatfile/hooks'

type Unique = {
  [K in Extract<keyof FieldConfig, string>]: { [value: string]: number[] }
}
export class UniqueAndRequiredPlugin {
  public run(fields: FieldConfig, records: FlatfileRecord<any>[]): void {
    const uniques: Unique = {} as Unique
    const requiredFields: Extract<keyof FieldConfig, string>[] = []

    // build initial uniques and requiredFields
    for (let x in fields) {
      if (fields[x].options.unique === true) {
        uniques[x] = {}
      }
      if (fields[x].options.required === true) {
        requiredFields.push(x)
      }
    }

    records.map((record, index) => {
      // check required fields and add error if missing
      requiredFields.forEach((field) => {
        const value = record.get(field)
        if (value === undefined || value === null || value === '') {
          record.addError(field, 'Required Value')
        }
      })

      // add to unique fields if not already in there
      for (let uniqueFieldKey in uniques) {
        const value = String(record.get(uniqueFieldKey))
        if (uniques[uniqueFieldKey][value]) {
          uniques[uniqueFieldKey][value].push(index)
        } else {
          // only add to uniques array if value is not null || undefined || ''
          if (value !== undefined && value !== null && value !== '') {
            uniques[uniqueFieldKey][value] = [index]
          }
        }
      }
    })

    // add errors for unique fields
    for (let uniqueFieldKey in uniques) {
      for (let value in uniques[uniqueFieldKey]) {
        if (uniques[uniqueFieldKey][value].length > 1) {
          const indexes = uniques[uniqueFieldKey][value]
          indexes.forEach((index) => {
            records[index].addError(uniqueFieldKey, 'Value must be unique')
          })
        }
      }
    }
  }
}
