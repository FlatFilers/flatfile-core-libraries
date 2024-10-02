import { FlatfileClient } from '@flatfile/api'
import {
  DefaultSubmitSettings,
  JobHandler,
  SheetHandler,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import { FlatfileRecord } from '@flatfile/hooks'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'

interface SimpleListenerType
  extends Pick<
    SimpleOnboarding,
    'onRecordHook' | 'onSubmit' | 'submitSettings'
  > {
  slug: string
}

const api = new FlatfileClient()

const createSimpleListener = ({
  onRecordHook,
  onSubmit,
  slug,
  submitSettings,
}: SimpleListenerType) =>
  FlatfileListener.create((client: FlatfileListener) => {
    if (onRecordHook) {
      client.use(
        recordHook(
          slug,
          async (record: FlatfileRecord, event: FlatfileEvent | undefined) =>
            onRecordHook(record, event)
        )
      )
    }
    if (onSubmit) {
      const onSubmitSettings = { ...DefaultSubmitSettings, ...submitSettings }
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

              if (onSubmit) {
                await onSubmit({ job, sheet, event })
              }

              await api.jobs.complete(jobId, {
                outcome: {
                  message: 'complete',
                },
              })
              if (onSubmitSettings.deleteSpaceAfterSubmit) {
                await api.spaces.archiveSpace(spaceId)
              }
            } catch (error: any) {
              if (jobId) {
                await api.jobs.cancel(jobId)
              }
              console.error('Error:', error.stack)
            }
          })
        }
      )
    }
  })

export default createSimpleListener
