import { FlatfileClient } from '@flatfile/api'
import {
  DefaultSubmitSettings,
  handlePostMessage,
  JobHandler,
  NewSpaceFromPublishableKey,
  SheetHandler,
} from '@flatfile/embedded-utils'
import { FlatfileRecord } from '@flatfile/hooks'
import { Browser, FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { SimpleListenerType } from './types'

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
export async function createlistener(
  accessToken: string,
  apiUrl: string,
  listener: FlatfileListener,
  closeSpace: NewSpaceFromPublishableKey['closeSpace'],
  onClose: () => void
): Promise<() => void> {
  const browser_instance = new Browser({
    apiUrl,
    accessToken,
    fetchApi: fetch,
  })
  const ff_message_handler = handlePostMessage(closeSpace, listener, onClose)

  listener.mount(browser_instance)
  window.addEventListener('message', ff_message_handler, false)

  return () => {
    window.removeEventListener('message', ff_message_handler)
    listener.unmount(browser_instance)
  }
}

/**
 * @description Creates a Flatfile listener that handles simple submissions and record
 * hooks. It uses the `FlatfileClient` class to interact with the Flatfile API and
 * listens for job "ready" events to handle submission and record hooks.
 * 
 * @param {SimpleListenerType} .onRecordHook - hook function that is triggered after
 * each record has been processed during data ingestion, allowing for custom behavior
 * or actions to be taken on individual records.
 * 
 * @param {SimpleListenerType} .onSubmit - onSubmit callback function that will be
 * called after a job is submitted, allowing it to process and respond to the event.
 * 
 * @param {SimpleListenerType} .slug - unique identifier for the space where the
 * Flatfile data will be stored.
 * 
 * @param {SimpleListenerType} .submitSettings - 3rd party application's settings for
 * submitting data to the server, such as whether or not to delete the space after submission.
 * 
 * @returns {FlatfileListener} a FlatfileClient instance that can be used to handle
 * Flatfile events.
 * 
 * 	* `client`: A new FlatfileClient instance is created to handle listener functions.
 * 	* `use`: If `onRecordHook` is defined, a record hook is used to process records.
 * The hook function takes two arguments: `record` (the current record being processed)
 * and `event` (the event emitted by the flatfile client).
 * 	* `onSubmitSettings`: An object containing submit settings, which are merged with
 * the default settings provided in the `SimpleListenerType`.
 * 	* `jobId`, `spaceId`, `workbookId`: These properties represent the context of the
 * job being listened to, including the job ID, space ID, and workbook ID.
 * 
 * 	In summary, the `createSimpleListener` function creates a new FlatfileClient
 * instance and sets up a simple listener to handle jobs and submits. It also allows
 * for customization of submit settings through the `onSubmitSettings` property.
 */
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
            await api.jobs.ack(jobId, { info: 'Starting job', progress: 10 })

            const job = new JobHandler(jobId)
            const { data: workbookSheets } = await api.sheets.list({
              workbookId,
            })

            // this assumes we are only allowing 1 sheet here (which we've talked about doing initially)
            const sheet = new SheetHandler(workbookSheets[0].id)

            await onSubmit({ job, sheet, event })

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
      })
    }
  })
