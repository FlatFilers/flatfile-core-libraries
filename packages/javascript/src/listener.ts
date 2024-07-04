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
 * @description Creates a Flatfile listener for the given slug, using the `FlatfileClient`
 * API to interact with the Flatfile platform. It sets up an onRecordHook and an
 * onSubmit action, if provided, and then filters the events emitted by the client
 * to handle the onSubmit action.
 * 
 * @param {SimpleListenerType} .onRecordHook - function to be called when a record
 * is received, and allows for custom logic to be added before the record is processed
 * by the Flatfile listener.
 * 
 * @param {SimpleListenerType} .onSubmit - callback function that will be called when
 * the submit action is completed successfully, with the `job`, `sheet`, and `event`
 * objects as arguments.
 * 
 * @param {SimpleListenerType} .slug - slug of the workbook, which is used to identify
 * the specific workbook for which the Flatfile listener is created and configured.
 * 
 * @param {SimpleListenerType} .submitSettings - submit settings for the Flatfile
 * listener, allowing you to customize how the listener handles submitted jobs.
 * 
 * @returns {FlatfileListener} a Flatfile listener that listens for simple submissions
 * and performs the specified actions on job ready events.
 * 
 * 	* `client`: A FlatfileClient object that can be used to interact with the Flatfile
 * API.
 * 	* `onRecordHook`: An optional callback function that will be called when a record
 * is hit in the Flatfile stream. The function takes two arguments: `record` (the
 * recorded event) and `event` (the original event).
 * 	* `onSubmit`: An optional callback function that will be called when a submission
 * occurs. The function takes three arguments: `job`, `sheet`, and `event`. The `job`
 * argument is an instance of JobHandler, the `sheet` argument is an instance of
 * SheetHandler, and the `event` argument is an object containing information about
 * the submission event.
 * 	* `slug`: A unique identifier for the listener, used to differentiate between
 * multiple listeners in a single space.
 * 	* `submitSettings`: An optional object that contains settings for submission
 * behavior. The properties of this object are:
 * 		+ `deleteSpaceAfterSubmit`: A boolean value indicating whether the space should
 * be archived after a successful submission.
 * 
 * 	In summary, the `createSimpleListener` function takes in various configuration
 * options and returns a FlatfileClient object with an optional onRecordHook callback
 * function and an optional onSubmit callback function, as well as a unique slug
 * identifier and an optionally passed submitSettings object containing space deletion
 * settings after submission.
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
