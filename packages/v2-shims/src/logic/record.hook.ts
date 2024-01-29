import { FlatfileRecord } from '@flatfile/hooks'
import { FlatfileEvent } from '@flatfile/listener'
import { ScalarDictionary } from '../types'
import { IDataHookResponse } from '../types/validation.response'

export function convertHook(hook: V2RecordHook): ModernHook {
  return async (r) => {
    const hookResults = await hook(recordToDictionary(r), 0, 'update')
    return applyResults(hookResults, r)
  }
}

/**
 * Converts a Flatfile record to a basic scalar dictionary
 *
 * @param record
 */
export function recordToDictionary(record: FlatfileRecord): ScalarDictionary {
  const obj = record.value
  return Object.keys(obj).reduce((acc, k) => {
    const prop = obj[k]
    if (prop && typeof prop === 'object' && 'value' in prop) {
      return { ...acc, [k]: prop.value }
    } else {
      return { ...acc, [k]: prop }
    }
  }, {} as ScalarDictionary)
}

/**
 * Applies a simple datahook response back to a record
 *
 * @param hookResults
 * @param record
 */
export function applyResults(
  hookResults: IDataHookResponse,
  record: FlatfileRecord
): FlatfileRecord {
  Object.keys(hookResults).forEach((k) => {
    const prop = hookResults[k]
    const value = typeof prop === 'object' ? prop?.value : prop

    // historically only modified values had to be returned
    if (value !== undefined) {
      record.set(k, value ?? null)
    }

    const info = typeof prop === 'object' ? prop?.info : null
    if (info) {
      info.forEach((i: Record<string, any>) => {
        if (i.level === 'error') record.addError(k, i.message)
        if (i.level === 'warning') record.addWarning(k, i.message)
        if (i.level === 'info') record.addInfo(k, i.message)
      })
    }
  })
  return record
}

type V2RecordHook = (
  row: ScalarDictionary,
  index: number,
  mode: string
) => IDataHookResponse | Promise<IDataHookResponse>

type ModernHook = (record: FlatfileRecord, e?: FlatfileEvent) => Promise<any>
