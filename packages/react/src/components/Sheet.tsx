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

export const Sheet = (props: SheetProps) => {
  const { config, onRecordHook, onSubmit, submitSettings } = props
  const { addSheet, updateWorkbook, createSpace } = useContext(FlatfileContext)

  const callback = useCallback(() => {
    // Manage actions immutably
    if (onSubmit) {
      // Use a spread operator to safely append to actions without mutating original workbook
      const updatedWorkbook = {
        ...createSpace.workbook,
        actions: [
          workbookOnSubmitAction,
          ...(createSpace.workbook.actions || []),
        ],
      }
      updateWorkbook(updatedWorkbook)
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
      [createSpace]
    )
  }

  if (onSubmit) {
    const onSubmitSettings = {
      ...DefaultSubmitSettings,
      ...submitSettings,
    }
    useEvent(
      'job:ready',
      { job: `workbook:${workbookOnSubmitAction.operation}` },
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
