import { FlatfileClient } from '@flatfile/api'

import { FlatfileRecord } from '@flatfile/hooks'
import { Browser, FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import {
  DefaultSubmitSettings,
  NewSpaceFromPublishableKey,
  SimpleOnboarding,
} from '../types'
import { handlePostMessage } from './handlePostMessage'
import { JobHandler } from './JobHandler'
import { SheetHandler } from './SheetHandler'

export interface SimpleListenerType
  extends Pick<
    SimpleOnboarding,
    'onRecordHook' | 'onSubmit' | 'submitSettings'
  > {
  slug: string
}

/**
 * Add a listener to handle postMessage events
 *
 * @param accessToken
 * @param apiUrl
 * @param listener
 * @param closeSpace
 * @param onClose
 * @returns Promise<() => void>
 */
export async function createListener(
  accessToken: string,
  apiUrl: string,
  listener: FlatfileListener,
  closeSpace: NewSpaceFromPublishableKey['closeSpace'],
  onClose: () => void,
  onInit: (data: { localTranslations: Record<string, any> }) => void
): Promise<() => void> {
  const browser_instance = new Browser({
    apiUrl,
    accessToken,
    fetchApi: fetch,
  })
  const ff_message_handler = handlePostMessage(
    closeSpace,
    listener,
    onClose,
    onInit
  )

  listener.mount(browser_instance)
  window.addEventListener('message', ff_message_handler, false)

  return () => {
    window.removeEventListener('message', ff_message_handler)
    listener.unmount(browser_instance)
  }
}

export const createSimpleListener = ({
  onRecordHook,
  onSubmit,
  slug,
  submitSettings,
}: SimpleListenerType) =>
  FlatfileListener.create((client: FlatfileListener) => {
    const api = new FlatfileClient()
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
      client.filter({ job: 'workbook:simpleSubmitAction' }, (configure) => {
        configure.on('job:ready', async (event) => {
          const { jobId, spaceId, workbookId } = event.context
          try {
            await api.jobs.ack(jobId, {
              info: 'jobs.messages.startingJob',
              progress: 10,
            })

            const job = new JobHandler(jobId)
            const { data: workbookSheets } = await api.sheets.list({
              workbookId,
            })

            // this assumes we are only allowing 1 sheet here (which we've talked about doing initially)
            const sheet = new SheetHandler(workbookSheets[0].id)

            await onSubmit({ job, sheet, event })

            await api.jobs.complete(jobId, {
              outcome: {
                acknowledge: submitSettings?.complete?.acknowledge ?? true,
                message: submitSettings?.complete?.message ?? 'complete',
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
      })
    }
  })
