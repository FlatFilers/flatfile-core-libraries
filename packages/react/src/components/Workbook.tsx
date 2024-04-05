import FlatfileContext from './FlatfileContext'
import React, { useCallback, useContext } from 'react'
import { FlatfileClient, type Flatfile } from '@flatfile/api'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'
import { TRecordDataWithLinks, TPrimitive } from '@flatfile/hooks'
import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import { useEvent, usePlugin } from '../hooks'
import {
  DefaultSubmitSettings,
  JobHandler,
  SheetHandler,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import { workbookOnSubmitAction } from '../utils/constants'

type onRecordHook<T> = (record: T, event?: FlatfileEvent) => FlatfileRecord

type HookConfig<T> = [string, onRecordHook<T>] | [onRecordHook<T>]

type onRecordHooks<T> = HookConfig<T>[]

export const Workbook = (
  props: {
    config?: Flatfile.CreateWorkbookConfig
    children?: React.ReactNode
  } & Pick<SimpleOnboarding, 'onSubmit' | 'submitSettings'> & {
      onRecordHooks?: onRecordHooks<
        FlatfileRecord<TRecordDataWithLinks<TPrimitive>>
      >
    }
) => {
  const { config, children, onRecordHooks, onSubmit } = props
  const { updateWorkbook, createSpace } = useContext(FlatfileContext)
  const { sheets } = createSpace.workbook
  // Accept a workbook onSubmit function and add it to the workbook actions

  const callback = useCallback(() => {
    let tmp
    if (onSubmit) {
      if (!config?.actions) {
        tmp = {
          actions: [workbookOnSubmitAction],
        }
      } else {
        config.actions = [workbookOnSubmitAction, ...(config.actions || [])]
      }
    }
    updateWorkbook(tmp ?? config)
  }, [config, updateWorkbook])

  useDeepCompareEffect(callback, [config])

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
              return slug(record, event)
            }
          ),
          []
        )
      } else if (typeof slug === 'string' && typeof hook === 'function') {
        usePlugin(
          recordHook(
            slug,
            async (
              record: FlatfileRecord,
              event: FlatfileEvent | undefined
            ) => {
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

  return <>{children}</>
}
