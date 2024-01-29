import { FlatfileEvent } from '@flatfile/configure'
import { EventTopic } from '@flatfile/api'
const XLSX = require('xlsx')
const axios = require('axios')
const FormData = require('form-data')

async function XLSXParser(event: FlatfileEvent) {
  const { domain, name } = event
  if (domain === 'file' && name === EventTopic.Uploadcompleted) {
    const api = event.api

    const { data } = await api.getFile({ fileId: event.context.fileId })
    if (data.ext === 'xlsx') {
      // Customize your Excel extraction here
      const file = await api.downloadFile({ fileId: event.context.fileId })
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const workbook = await XLSX.read(buffer, {
        type: 'buffer',
        cellDates: true,
      })

      for (const sheetName of Object.keys(workbook.Sheets)) {
        await uploadCSV(
          event,
          sheetName,
          XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], {
            blankrows: false,
            rawNumbers: true,
          })
        )
      }
    }
  }
}

async function uploadCSV(event: FlatfileEvent, sheetName: string, data: any) {
  const api = event.api
  const formData = new FormData()
  formData.append('spaceId', event.context.spaceId)
  formData.append('environmentId', event.context.environmentId)
  formData.append('file', Buffer.from(data), {
    filename: `Sheet ${sheetName}.csv`,
  })

  // TODO: Replace last sxios call with calls from the @flatfile/api package once it supports file upload
  const csv = await axios.post(`v1/files`, formData, {
    headers: formData.getHeaders(),
    transformRequest: () => formData,
  })

  const extraction = await api.createJob({
    jobConfig: {
      type: 'file',
      operation: 'extract',
      source: csv.data.id,
      config: {
        driver: 'csv',
      },
    },
  })

  if (!extraction || !extraction.data) {
    console.log(`Extraction failed: ${JSON.stringify(extraction.data)}`)
    return
  }

  const { id } = extraction.data

  await api.executeJob({ jobId: id })
}

export default XLSXParser
