import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import api, { Flatfile } from '@flatfile/api'
import RecordObject from '../types/record.object'
import FlatfileResults from '../legacy/results'
import { Meta } from '../legacy/meta'
import { getAllRecords } from '../logic/get.all.records'

/**
 * A plugin for handling data
 *
 * @todo does this approach make sense with the modern javascript client?
 *
 * @param handler
 */
export const handleData = (
  handler: (results: FlatfileResults) => void | Promise<void>
) => {
  return (listener: FlatfileListener) => {
    listener
      .filter({ job: 'workbook:submitAction' })
      .on('job:ready', async (event) => {
        const results = await getResultsForContextSheet(event.context.workbooks)
        return handler(results)
      })
  }
}

/**
 * Returns a legacy V2 results shim for the current sheet.
 *
 * @todo solve pagination
 * @param event
 */
export const getResultsForContextSheet = async (event: FlatfileEvent) => {
  const sheet = await getSheet(event.context.workbookId)

  const records = await getAllRecords(sheet.id)

  return new FlatfileResults(records.map(convertRecord), new Meta())
}

/**
 * Convert an individual record to the legacy V2 format
 *
 * @param record
 * @param sequence
 */
function convertRecord(
  record: Flatfile.RecordWithLinks,
  sequence: number
): RecordObject {
  const data: RecordObject['data'] = {}

  for (const key in record.values) {
    data[key] = record.values[key].value as any
  }

  return {
    sequence: sequence + 1,
    valid: record.valid || false,
    data: data,
    deleted: false,
  }
}

/**
 * Get a single sheet from the workbook
 *
 * @param workbookId
 */
async function getSheet(workbookId: string) {
  // Collect all Sheet and Record data from the Workbook
  const { data: sheets } = await api.sheets.list({ workbookId })
  if (sheets.length > 1) {
    throw new Error(
      'You cannot use the v2 data handling shim with more than 1 sheet.'
    )
  }
  if (!sheets.length) {
    throw new Error('You cannot use the v2 data handling shim with no sheets.')
  }

  return sheets[0]
}
