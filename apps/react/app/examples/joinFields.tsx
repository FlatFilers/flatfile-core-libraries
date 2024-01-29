import api, { Flatfile } from '@flatfile/api'
import { recordHook } from '@flatfile/plugin-record-hook'
import { FlatfileListener } from '@flatfile/listener'

export const config: Pick<
  Flatfile.CreateWorkbookConfig,
  'name' | 'sheets' | 'actions'
> = {
  name: 'Employees workbook',
  sheets: [
    {
      name: 'TestSheet',
      slug: 'TestSheet',
      fields: [
        {
          key: 'first_name',
          type: 'string',
          label: 'First name',
          constraints: [
            {
              type: 'required',
            },
          ],
        },
        {
          key: 'last_name',
          type: 'string',
          label: 'last name',
        },
        {
          key: 'full_name',
          type: 'string',
          label: 'full name',
        },
      ],
      actions: [
        {
          label: 'Join fields',
          operation: 'contacts:join-fields',
          description: 'Would you like to join fields?',
          mode: 'foreground',
          confirm: true,
        },
      ],
    },
  ],
  actions: [
    {
      label: 'Submit',
      operation: 'contacts:submit',
      description: 'Would you like to submit your workbook?',
      mode: 'foreground',
      primary: true,
      confirm: true,
    },
  ],
}

async function joinFields(jobId: string, sheetId: string) {
  await api.jobs.ack(jobId, {
    info: "I'm starting the joining fields job",
  })

  const records = await api.records.get(sheetId)
  const recordsUpdates = records.data.records?.map((record) => {
    const fullName = `${record.values['first_name'].value} ${record.values['last_name'].value}`
    record.values['full_name'].value = fullName
    return record
  })

  await api.records.update(sheetId, recordsUpdates as Flatfile.Record_[])

  await api.jobs.complete(jobId, {
    info: "Job's work is done",
  })
}

/**
 * Example Listener
 */
export const listener = FlatfileListener.create((client) => {
  client.on(
    'job:ready',
    // @ts-ignore
    { payload: { operation: 'contacts:join-fields' } },
    async (event: any) => {
      const { context } = event
      console.log('join-fields', event)
      return joinFields(context.jobId, context.sheetId)
    }
  )

  client.use(
    recordHook('TestSheet', (record) => {
      record.set('last_name', 'new last name')
      record.addError('last_name', 'this is an incorrect last name')
      return record
    })
  )
})
