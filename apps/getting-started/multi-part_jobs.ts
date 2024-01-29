import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'

export default function (listener: FlatfileListener) {
  listener.filter({ job: 'space:configure' }, (configure) => {
    configure.on(
      'job:ready',
      async ({ context: { spaceId, environmentId, jobId } }) => {
        try {
          await api.jobs.ack(jobId, {
            info: 'Gettin started.',
            progress: 10,
          })

          await api.workbooks.create({
            spaceId,
            environmentId,
            name: 'Red',
            labels: ['primary'],
            // namespace: 'red',
            sheets: [
              {
                name: 'Red Contacts',
                slug: 'contacts',
                fields: [
                  {
                    key: 'firstName',
                    type: 'string',
                    label: 'First Name',
                  },
                  {
                    key: 'lastName',
                    type: 'string',
                    label: 'Last Name',
                  },
                  {
                    key: 'email',
                    type: 'string',
                    label: 'Email',
                  },
                ],
                actions: [
                  {
                    operation: 'submitLargeSheet',
                    mode: 'foreground',
                    label: 'Submit Large Sheet',
                    type: 'string',
                    description: 'Split sheet up into parts and submit',
                    primary: true,
                  },
                ],
              },
            ],
            actions: [
              {
                operation: 'submitActionFg',
                mode: 'foreground',
                label: 'Submit foreground',
                type: 'string',
                description: 'Submit data to webhook.site',
                primary: true,
              },
            ],
          })

          await api.documents.create(spaceId, {
            title: 'Getting Started',
            body:
              '# Welcome\n' +
              '### Say hello to your first customer Space in the new Flatfile!\n' +
              "Let's begin by first getting acquainted with what you're seeing in your Space initially.\n" +
              '---\n',
          })

          await api.jobs.complete(jobId, {
            outcome: {
              message: 'This job is now complete.',
            },
          })
        } catch (error) {
          console.error('Error:', error.stack)

          await api.jobs.fail(jobId, {
            outcome: {
              message: 'This job encountered an error.',
            },
          })
        }
      }
    )
  })

  listener.filter(
    { job: 'sheet:submitLargeSheet', isPart: false },
    (submitLargeSheet) => {
      submitLargeSheet.on('job:ready', async (event) => {
        const {
          context: { jobId, sheetId, workbookId },
        } = event
        console.log('job:ready [PARENT]', { jobId: event.context.jobId })

        const { data: counts } = await api.sheets.getRecordCounts(sheetId)
        const { total } = counts.counts
        await api.jobs.ack(jobId, {
          info: `Splitting Job`,
          progress: 10,
        })

        const workbook = await api.workbooks.get(workbookId)
        console.log('splitting job: ', { jobId, total })

        const splitjob = await api.jobs.split(jobId, { parts: total })
        console.log('splitjob: ', { splitjob })

        await api.jobs.ack(jobId, {
          info: `Job Split into ${total} parts.`,
          progress: 20,
        })
      })
      submitLargeSheet.on('job:parts-completed', async (event) => {
        const {
          context: { jobId },
        } = event

        console.log('job:parts-completed: ', jobId)

        await api.jobs.complete(jobId, {
          outcome: {
            message: 'This job is now complete.',
          },
        })
      })
    }
  )

  listener.filter(
    { job: 'sheet:submitLargeSheet', isPart: true },
    (submitLargeSheet) => {
      submitLargeSheet.on('job:ready', async (event) => {
        const {
          context: { jobId },
        } = event

        const job = await api.jobs.get(jobId)
        console.dir({ job }, { depth: 10 })
        const { partData, parentId } = job.data
        const { records } = await event.data({
          pageSize: 1,
          pageNumber: partData.part + 1,
        })

        console.log({ record: records[0].values })
        console.log('submitting part: ', jobId, partData)

        await new Promise((r) => setTimeout(r, 1000))

        await api.jobs.complete(jobId, {
          outcome: {
            message: 'This job is now complete.',
          },
        })

        await api.jobs.ack(parentId, {
          info: `Part ${partData.part + 1} / ${partData.total} submitted. `,
          progress: 20 + (partData.part + 1 / partData.total) * 80,
        })
      })
    }
  )

  listener.use(
    recordHook('contacts', (record) => {
      const firstName = record.get('firstName')
      console.log({ firstName })
      // if ()
      return record
    })
  )

  listener.on('**', (event) => {
    console.log('EVENT -> ', event.topic)
  })
}
