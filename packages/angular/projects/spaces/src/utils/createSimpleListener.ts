import api from '@flatfile/api'
import {
  JobHandler,
  SheetHandler,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import { FlatfileRecord } from '@flatfile/hooks'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'

interface SimpleListenerType
  extends Pick<SimpleOnboarding, 'onRecordHook' | 'onSubmit'> {
  slug: string
}

const createSimpleListener = ({
  onRecordHook,
  onSubmit,
  slug,
}: SimpleListenerType) =>
  FlatfileListener.create((client: FlatfileListener) => {
    if (onRecordHook) {
      client.use(
        recordHook(
          slug,
          async (record: FlatfileRecord, event?: FlatfileEvent) =>
            // @ts-ignore - something weird with the `data` prop and the types upstream in the packages being declared in different places, but overall this is fine
            onRecordHook(record, event)
        )
      )
    }
    if (onSubmit) {
      client.filter(
        { job: 'workbook:simpleSubmitAction' },
        (configure: FlatfileListener) => {
          configure.on('job:ready', async (event: FlatfileEvent) => {
            const { jobId, spaceId, workbookId } = event.context
            try {
              await api.jobs.ack(jobId, { info: 'Starting job', progress: 10 })

              const job = new JobHandler(jobId)
              const { data: workbookSheets } = await api.sheets.list({
                workbookId,
              })

              // this assumes we are only allowing 1 sheet here (which we've talked about doing initially)
              const sheet = new SheetHandler(workbookSheets[0].id)

              await onSubmit({ job, sheet })

              await api.jobs.complete(jobId, {
                outcome: {
                  message: 'complete',
                },
              })
              await api.spaces.delete(spaceId)
            } catch (error: any) {
              if (jobId) {
                await api.jobs.cancel(jobId)
              }
              if (spaceId) {
                await api.spaces.delete(spaceId)
              }
              console.error('Error:', error.stack)
            }
          })
        }
      )
    }
  })

export default createSimpleListener
