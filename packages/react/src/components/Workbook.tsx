import FlatfileContext from './FlatfileContext'
import React, { useCallback, useContext, useEffect } from 'react'
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

export type onRecordHook<T> = (
  record: T,
  event?: FlatfileEvent
) => FlatfileRecord

type HookConfig<T> = [string, onRecordHook<T>] | [onRecordHook<T>]

export type onRecordHooks<T> = HookConfig<T>[]

type WorkbookProps = {
  config?: Flatfile.CreateWorkbookConfig
  onSubmit?: SimpleOnboarding['onSubmit']
  submitSettings?: SimpleOnboarding['submitSettings']
  onRecordHooks?: onRecordHooks<
    FlatfileRecord<TRecordDataWithLinks<TPrimitive>>
  >
  children?: React.ReactNode
}

/**
 * `Workbook` component for integrating Flatfile's import functionality within a React application.
 * This component allows for the configuration of a Flatfile workbook, submission settings, and record hooks.
 *
 * @component
 * @example
 * const config = {
 *   name: 'Example Workbook',
 *   sheets: []
 * }
 * const onSubmit = (data) => console.log(data)
 * const submitSettings = {...}
 * const onRecordHooks = [
 *   ['slug', (record) => {
 *      record.set('key', 'foo')
 *      return record
 *   }]
 * ]
 *
 * <Workbook
 *   config={config}
 *   onSubmit={onSubmit}
 *   submitSettings={submitSettings}
 *   onRecordHooks={onRecordHooks}
 * >
 *   <Sheet config={sheetConfig} />
 * </Workbook>
 *
 * @param {WorkbookProps} props - The properties passed to the Workbook component.
 * @param {Flatfile.CreateWorkbookConfig} [props.config] - Configuration object for the Flatfile workbook.
 * @param {Function} [props.onSubmit] - Callback function to be executed upon submission of the workbook.
 * @param {Object} [props.submitSettings] - Settings object for workbook submission.
 * @param {onRecordHooks<FlatfileRecord<TRecordDataWithLinks<TPrimitive>>>} [props.onRecordHooks] - Array of hooks to be executed on each record.
 * @param {React.ReactNode} [props.children] - Child components to be rendered within the Workbook component.
 * @returns {React.ReactElement} A React component that renders the Flatfile workbook.
 */

export const Workbook = (props: WorkbookProps) => {
  const { config, children, onRecordHooks, onSubmit } = props
  const { updateWorkbook, createSpace } = useContext(FlatfileContext)
  // Accept a workbook onSubmit function and add it to the workbook actions

  const callback = useCallback(() => {
    // adds workbook action if onSubmit is passed along
    updateWorkbook(
      onSubmit
        ? {
            ...config,
            actions: [workbookOnSubmitAction(), ...(config?.actions || [])],
          }
        : config
    )
  }, [config, onSubmit])

  useDeepCompareEffect(callback, [config])

  onRecordHooks?.map(([slug, hook], index) => {
    if (typeof slug === 'function') {
      usePlugin(
        recordHook(
          createSpace.workbook.sheets?.[index]?.slug || '**',
          async (record: FlatfileRecord, event: FlatfileEvent | undefined) => {
            return slug(record, event)
          }
        ),
        [createSpace.workbook.sheets, onRecordHooks]
      )
    } else if (typeof slug === 'string' && typeof hook === 'function') {
      usePlugin(
        recordHook(
          slug,
          async (record: FlatfileRecord, event: FlatfileEvent | undefined) => {
            console.log('WORKBOOK recordHook', { record, event })
            return hook(record, event)
          }
        ),
        [createSpace.workbook.sheets, onRecordHooks]
      )
    }
  })

  if (onSubmit) {
    const onSubmitSettings = {
      ...DefaultSubmitSettings,
      ...props.submitSettings,
    }
    useEvent(
      'job:ready',
      { job: `workbook:${workbookOnSubmitAction().operation}` },
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
