import api, { Flatfile } from '@flatfile/api'

/**
 * Convenience method for getting all records for a sheet. This will get records page by page until
 * all records have been fetched.
 *
 * @param sheetId
 */
export async function getAllRecords(
  sheetId: string,
  options?: Flatfile.GetRecordsRequest
): Promise<Flatfile.RecordWithLinks[]> {
  const PAGE_SIZE = 1000
  const MAX_PAGES = 100

  const allRecords: Flatfile.RecordWithLinks[] = []

  let pageNumber = 1
  while (true) {
    // get the next page of records
    // todo: handle errors better here
    const response = await api.records.get(sheetId, {
      pageNumber,
      pageSize: PAGE_SIZE,
      ...options,
    })

    // If there are no records or no records on the page we stop
    // todo: if this is null, an error occured
    if (!response.data?.records || !response.data.records.length) {
      break
    }

    // Add the records to the result array
    // todo: using a spread operator here is not ideal for performance, improve
    allRecords.push(...response.data.records)

    // If the records returned are less than the page size we're on the last page, so we stop.
    if (response.data.records.length < PAGE_SIZE) {
      break
    }

    // increment the page number, if we want to fetch pages in parallel this will need to be refactored later
    pageNumber++

    // If we've fetched more than the max pages we stop - todo: this should likely error
    if (pageNumber > MAX_PAGES) {
      break
    }
  }

  return allRecords
}
