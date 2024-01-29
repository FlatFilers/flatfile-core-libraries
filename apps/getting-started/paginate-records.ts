import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'

export default function (listener: FlatfileListener) {
  listener.on('**', async (event) => {
    const data = await event.data
    console.log({ data })
  })

  listener.filter({ job: 'sheet:contacts:join-fields' }, (configure) => {
    configure.on('job:ready', async (event) => {
      const { jobId } = event.context

      try {
        await api.jobs.ack(jobId, {
          info: 'Starting job to submit action to webhook.site',
          progress: 10,
        })
        const allRecords = []
        let pageNumber = 1
        while (true) {
          const { records } = await event.data({
            pageNumber,
          })

          if (records.length === 0) {
            break
          }
          allRecords.push(...records)
          pageNumber++
        }

        console.log('allRecords.length: ', allRecords.length)
        await api.jobs.complete(jobId, {
          outcome: {
            message: `${allRecords.length} records were successfully retrieved . Go check it out!`,
          },
        })
      } catch (error) {
        await api.jobs.fail(jobId, {
          outcome: {
            message:
              "This job failed probably because it couldn't find the webhook.site URL.",
          },
        })
      }
    })
  })
}
