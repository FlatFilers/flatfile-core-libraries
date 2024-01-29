import { FlatfileListener } from '@flatfile/listener'
import api, { Flatfile } from '@flatfile/api'
// @ts-ignore
import Color from 'color'

export const config: Pick<
  Flatfile.CreateWorkbookConfig,
  'name' | 'sheets' | 'actions'
> = {
  name: 'Color workbook',
  sheets: [
    {
      name: 'TestSheet',
      slug: 'TestSheet',
      fields: [
        {
          key: 'color',
          type: 'string',
          label: 'Color',
        },
      ],
      actions: [
        {
          label: 'Convert color to hex',
          operation: 'colors:convert-color',
          description: 'Would you like to convert colors to Hex?',
          mode: 'foreground',
          confirm: true,
        },
      ],
    },
  ],
  actions: [
    {
      label: 'Submit',
      operation: 'colors:submit',
      description: 'Would you like to submit your workbook?',
      mode: 'foreground',
      primary: true,
      confirm: true,
    },
  ],
}

async function convertColors(jobId: string, sheetId: string) {
  await api.jobs.ack(jobId, {
    info: "I'm starting the converting colors job",
  })

  const records = await api.records.get(sheetId)
  const recordsUpdates = records.data.records?.map((record) => {
    const newColor = Color(record.values.color.value).hex()
    record.values['color'].value = newColor

    return record
  })

  await api.records.update(sheetId, recordsUpdates as Flatfile.Record_[])

  await api.jobs.complete(jobId, {
    info: "Job's work is done",
  })
}

async function submit(jobId: string) {
  try {
    await api.jobs.ack(jobId, {
      info: "I'm starting the job - inside client",
      progress: 33,
    })

    // hit your API here
    await new Promise((res) => setTimeout(res, 2000))

    await api.jobs.complete(jobId, {
      info: "Job's work is done",
      outcome: { next: { type: 'wait' } },
    })
  } catch (error) {
    console.error('An error occurred:', error)
    await api.jobs.fail(jobId, {
      info: 'Job did not complete.',
    })
  }
}

/**
 * Example Listener
 */
export const listener = FlatfileListener.create((client) => {
  client.on(
    'job:ready',
    // @ts-ignore
    { payload: { operation: 'colors:convert-color' } },
    async (event: any) => {
      const { context } = event
      return convertColors(context.jobId, context.sheetId)
    }
  )

  client.on(
    'job:ready',
    // @ts-ignore
    { payload: { operation: 'colors:submit' } },
    async (event: any) => {
      const { context } = event
      return submit(context.jobId)
    }
  )
})
