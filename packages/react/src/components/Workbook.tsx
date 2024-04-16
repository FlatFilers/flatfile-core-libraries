import FlatfileContext from './FlatfileContext'
import React, { useCallback, useContext } from 'react'
import { type Flatfile } from '@flatfile/api'
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
import { OnSubmitAction, workbookOnSubmitAction } from '../utils/constants'

export type onRecordHook<T> = (
  record: T,
  event?: FlatfileEvent
) => FlatfileRecord

type HookConfig<T> = [string, onRecordHook<T>] | [onRecordHook<T>]

export type onRecordHooks<T> = HookConfig<T>[]

type WorkbookProps = Partial<{
  config: Flatfile.CreateWorkbookConfig
  onSubmit: SimpleOnboarding['onSubmit']
  submitSettings: SimpleOnboarding['submitSettings']
  onRecordHooks: onRecordHooks<FlatfileRecord<TRecordDataWithLinks<TPrimitive>>>
  children: React.ReactNode
}>

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

  usePlugin(
    (client) => {
      onRecordHooks?.map(([slug, hook], index) => {
        // If you have multiple sheets, and just pass 1 record hook to the onRecordHooks array and that record hook doesn't have a slug, then assume the record hook is for all sheets.
        // Otherwise if multiple record hooks are passed along with out slugs, then assume they are in the same order as the sheets provided
        const actualSlug =
          typeof slug === 'function'
            ? onRecordHooks?.length === 1 &&
              createSpace.workbook.sheets?.length > 1
              ? '**'
              : createSpace.workbook.sheets?.[index]?.slug
            : slug

        client.use(
          recordHook(actualSlug, async (record, event) => {
            if (typeof slug === 'function') {
              return slug(record, event)
            } else if (typeof hook === 'function') {
              // Ensure hook is a function before invoking
              return hook(record, event)
            }
          })
        )
      })
    },
    [config, createSpace.workbook.sheets, onRecordHooks]
  )

  if (onSubmit) {
    const onSubmitSettings = {
      ...DefaultSubmitSettings,
      ...props.submitSettings,
    }
    useEvent(
      'job:ready',
      { job: `workbook:${workbookOnSubmitAction().operation}` },
      OnSubmitAction(onSubmit, onSubmitSettings)
    )
  }

  return <>{children}</>
}
