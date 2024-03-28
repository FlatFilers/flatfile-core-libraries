import React from 'react'
import { Flatfile, FlatfileClient } from '@flatfile/api'
import { useContext, useEffect } from 'react'
import FlatfileContext from './FlatfileContext'
import { IFrameTypes } from '../types'
import { EmbeddedIFrameWrapper } from './EmbeddedIFrameWrapper'
import { Simplified } from './SimplifiedWorkbook'
import {
  DefaultSubmitSettings,
  JobHandler,
  SheetHandler,
} from '@flatfile/embedded-utils'
import { FlatfileEvent } from '@flatfile/listener'
import { recordHook, FlatfileRecord } from '@flatfile/plugin-record-hook'
import { usePlugin, useEvent } from '../hooks'

export const Sheet = (
  props: { config: Flatfile.SheetConfig } & IFrameTypes &
    Pick<Simplified, 'onRecordHook' | 'onSubmit' | 'submitSettings'>
) => {
  const { config, onRecordHook, onSubmit, ...sheetProps } = props
  const {
    sessionSpace,
    setOpen,
    flatfileConfiguration,
    setFlatfileConfiguration,
  } = useContext(FlatfileContext)

  useEffect(() => {
    console.log('Sheet useEffect', { slug: config.slug })
    setFlatfileConfiguration({
      ...flatfileConfiguration,
      sheets: [...(flatfileConfiguration.sheets ?? []), config],
      onSubmit,
    })
  }, [])

  //   let simpleListener
  if (onRecordHook) {
    if (!config) {
      throw new Error(
        'You must provide a sheet configuration to use the onRecordHook'
      )
    }
    usePlugin(
      recordHook(
        config.slug || '**',
        async (record: FlatfileRecord, event: FlatfileEvent | undefined) => {
          // @ts-ignore - something weird with the `data` prop and the types upstream in the packages being declared in different places, but overall this is fine
          return onRecordHook(record, event)
        }
      ),
      []
    )
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
        {...sheetProps}
      />
    )
  }
}
