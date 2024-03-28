import { EmbeddedIFrameWrapper } from './EmbeddedIFrameWrapper'
import { IFrameTypes } from '../types'
import FlatfileContext from './FlatfileContext'
import React, { useContext, useEffect, useRef } from 'react'
import { FlatfileClient, type Flatfile } from '@flatfile/api'
import { Simplified } from './SimplifiedWorkbook'
import { Exclusive } from './FlatfileProvider'
import {
  DefaultSubmitSettings,
  JobHandler,
  SheetHandler,
} from '@flatfile/embedded-utils'
import { FlatfileEvent } from '@flatfile/listener'
import { recordHook, FlatfileRecord } from '@flatfile/plugin-record-hook'
import { useEvent, useListener, usePlugin } from '../hooks'
import { TRecordDataWithLinks, TPrimitive } from '@flatfile/hooks'

type StandardWorkbook = {
  workbook: Flatfile.CreateWorkbookConfig
  document?: Flatfile.DocumentConfig
} & IFrameTypes

type onRecordHook<T> = (record: T, event?: FlatfileEvent) => FlatfileRecord

// type onRecordHooks<T> = Array<onRecordHook<T>>
type HookConfig<T> = [string, onRecordHook<T>] | [onRecordHook<T>]

type onRecordHooks<T> = HookConfig<T>[]

export const CombinedWorkbook = (
  props: Flatfile.CreateWorkbookConfig &
    Exclusive<
      StandardWorkbook,
      Omit<Simplified, 'onRecordHook'> & {
        onRecordHooks?: onRecordHooks<
          FlatfileRecord<TRecordDataWithLinks<TPrimitive>>
        >
      }
    >
) => {
  console.log('CombinedWorkbook', { props })
  const { workbook, document, sheets, onSubmit, onRecordHooks, ...combined } =
    props
  //   const { sheets, onSubmit, onRecordHook, ...simplifiedProps } = props
  const {
    sessionSpace,
    setOpen,
    flatfileConfiguration,
    setFlatfileConfiguration,
  } = useContext(FlatfileContext)

  useEffect(() => {
    console.log('CombinedWorkbook useEffect', { workbook, document, sheets })
    setFlatfileConfiguration({
      ...flatfileConfiguration,
      ...(!!workbook ? { workbook } : {}),
      ...(!!document ? { document } : {}),
      ...(!!sheets ? { sheets } : {}),
      onSubmit
    })
  }, [])

  if (onRecordHooks) {
    onRecordHooks.forEach(([slug, hook], index) => {
      if (typeof slug === 'function') {
        usePlugin(
          recordHook(
            sheets?.[index].slug || '**',
            async (
              record: FlatfileRecord,
              event: FlatfileEvent | undefined
            ) => {
              // @ts-ignore - something weird with the `data` prop and the types upstream in the packages being declared in different places, but overall this is fine
              return slug(record, event)
            }
          ),
          []
        )
      } else if (typeof slug === 'string') {
        usePlugin(
          recordHook(
            slug,
            async (
              record: FlatfileRecord,
              event: FlatfileEvent | undefined
            ) => {
              // @ts-ignore - something weird with the `data` prop and the types upstream in the packages being declared in different places, but overall this is fine
              return hook(record, event)
            }
          ),
          []
        )
      }
    })
  }

  if (onSubmit) {
    const onSubmitSettings = {
      ...DefaultSubmitSettings,
      ...props.submitSettings,
    }
    useEvent(
      'job:ready',
      { job: 'workbook:simpleSubmitAction' },
      async (event) => {
        const { jobId, spaceId, workbookId } = event.context
        const FlatfileAPI = new FlatfileClient()
        try {
          await FlatfileAPI.jobs.ack(jobId, {
            info: 'Starting job',
            progress: 10,
          })

          const job = new JobHandler(jobId)
          const { data: workbookSheets } = await FlatfileAPI.sheets.list({
            workbookId,
          })

          // this assumes we are only allowing 1 sheet here (which we've talked about doing initially)
          const sheet = new SheetHandler(workbookSheets[0].id)

          if (onSubmit) {
            await onSubmit({ job, sheet, event })
          }

          await FlatfileAPI.jobs.complete(jobId, {
            outcome: {
              message: 'complete',
            },
          })
          if (onSubmitSettings.deleteSpaceAfterSubmit) {
            await FlatfileAPI.spaces.archiveSpace(spaceId)
          }
        } catch (error: any) {
          if (jobId) {
            await FlatfileAPI.jobs.cancel(jobId)
          }
          console.log('Error:', error.stack)
        }
      }
    )
  }

  if (sessionSpace) {
    return (
      <EmbeddedIFrameWrapper
        handleCloseInstance={() => setOpen(false)}
        {...sessionSpace}
        {...combined}
      />
    )
  }
}

// Example Usage:
// const App = () => {
//   useListener((client) => {
//     client.on('**', (event) => {
//       console.log('App useListener Event => ', event.topic)
//     })
//   }, [])
//   return <Workbook workbook={workbook} />
// }

// const Main = () => {
//   return (
//     <FlatfileProvider publishableKey={PUBLISHABLE_KEY}>
//       <App />
//     </FlatfileProvider>
//   )
// }
