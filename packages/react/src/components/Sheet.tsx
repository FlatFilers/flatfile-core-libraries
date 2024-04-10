import React, { useCallback } from 'react'
import { Flatfile, FlatfileClient } from '@flatfile/api'
import { useContext } from 'react'
import FlatfileContext from './FlatfileContext'
import {
  DefaultSubmitSettings,
  JobHandler,
  SheetHandler,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import { FlatfileEvent } from '@flatfile/listener'
import { recordHook, FlatfileRecord } from '@flatfile/plugin-record-hook'
import { usePlugin, useEvent } from '../hooks'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'
import { workbookOnSubmitAction } from '../utils/constants'

type SheetProps = {
  config: Flatfile.SheetConfig
  onSubmit?: SimpleOnboarding['onSubmit']
  submitSettings?: SimpleOnboarding['submitSettings']
  onRecordHook?: SimpleOnboarding['onRecordHook']
}
/**
 * `Sheet` component for Flatfile integration.
 *
 * This component allows you to integrate Flatfile's data import capabilities into your React application.
 * It provides a way to configure and handle the import process, including submitting data and handling records.
 *
 * @component
 * @example
 * const config = {
 *   name: 'Contacts',
 *   slug: 'contacts',
 *   fields: [
 *     { label: 'First Name', key: 'firstName', type: 'string', },
 *     { label: 'Last Name', key: 'lastName', type: 'string', },
 *     { label: 'Email', key: 'email', type: 'string', contraints: [{ type: 'unique' }] }
 *   ]
 * }
 *
 * const onSubmit = async (results) => {
 *   console.log('Data submitted:', results.data)
 * }
 *
 * const onRecordHook = async (record, event) => {
 *   if (!record.email.includes('@example.com')) {
 *     return {
 *       email: {
 *         value: record.email,
 *         info: 'Only @example.com emails are allowed',
 *         level: 'error'
 *       }
 *     }
 *   }
 * }
 *
 * <Sheet config={config} onSubmit={onSubmit} onRecordHook={onRecordHook} />
 *
 * @param {Object} props - Component props
 * @param {Flatfile.SheetConfig} props.config - Configuration for the Flatfile import
 * @param {Function} [props.onSubmit] - Callback function to handle data submission
 * @param {Object} [props.submitSettings] - Settings for data submission
 * @param {Function} [props.onRecordHook] - Callback function to handle record manipulation
 */

export const Sheet = (props: SheetProps) => {
  const { config, onRecordHook, onSubmit, submitSettings } = props
  const { addSheet, updateWorkbook, createSpace } = useContext(FlatfileContext)

  const callback = useCallback(() => {
    // Manage actions immutably
    if (onSubmit) {
      updateWorkbook({
        actions: [
          workbookOnSubmitAction(config.slug),
          ...(createSpace.workbook.actions || []),
        ],
      })
    }
    addSheet(config)
  }, [config, createSpace, addSheet, updateWorkbook, onSubmit])

  useDeepCompareEffect(callback, [config])

  if (onRecordHook) {
    usePlugin(
      recordHook(
        config.slug || '**',
        async (record: FlatfileRecord, event: FlatfileEvent | undefined) => {
          return onRecordHook(record, event)
        }
      ),
      [config, onRecordHook]
    )
  }

  if (onSubmit) {
    const onSubmitSettings = {
      ...DefaultSubmitSettings,
      ...submitSettings,
    }
    useEvent(
      'job:ready',
      { job: `workbook:${workbookOnSubmitAction(config.slug).operation}` },
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

          const thisSheet = workbookSheets.find((s) => s.slug === config.slug)

          if (!thisSheet) {
            throw new Error(
              `Failed to find sheet slug:${config.slug} in the workbook id: ${workbookId}`
            )
          }
          const sheet = new SheetHandler(thisSheet.id)

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
  return <></>
}
