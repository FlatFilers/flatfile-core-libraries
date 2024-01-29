import { FlatfileListener } from '@flatfile/listener'
import api, { Flatfile, FlatfileClient } from '@flatfile/api'

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
          constraints: [
            {
              type: 'unique',
            },
          ],
        },
        {
          key: 'full_name',
          type: 'string',
          label: 'full name',
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

async function startCustomJob(jobId: string) {
  try {
    console.log('starting custom job at' + new Date())

    await api.jobs.ack(jobId, {
      info: "I'm starting the job - inside client",
      // progress only makes sense if multipart job - optional
      progress: 33,
    })

    // convert records here
    // await new Promise((res) => setTimeout(res, 2000));
    const res = await fetch(
      'https://webhook.site/ea44e287-2667-4e6a-a8db-f20bd4cea171'
    )

    if (res) {
      await api.jobs.complete(jobId, {
        info: "Job's work is done",
      })
    }
  } catch (error) {
    console.error('An error occurred:', error)
    await api.jobs.fail(jobId, {
      info: 'Job did not complete',
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
    { payload: { operation: 'contacts:submit' } },
    async (event: any) => {
      const { context } = event
      return startCustomJob(context.jobId)
    }
  )
})
