import React, { useContext, useEffect } from 'react'
import { Flatfile, FlatfileClient } from '@flatfile/api'
import {
  DefaultSubmitSettings,
  JobHandler,
  SheetHandler,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import { FlatfileEvent } from '@flatfile/listener'
import { recordHook, FlatfileRecord } from '@flatfile/plugin-record-hook'
import { EmbeddedIFrameWrapper } from './EmbeddedIFrameWrapper'
import { IFrameTypes } from '../types'
import { useListener } from '../hooks'
import FlatfileContext from './FlatfileContext'

export type Simplified = { sheets?: Flatfile.SheetConfig[] } & Omit<
  SimpleOnboarding,
  'publishableKey' | 'sheet'
> &
  IFrameTypes
  
/**
 * @deprecated use Sheet instead
 *
 */
export const SimplifiedWorkbook = (props: Simplified) => {
  const { sheets, onSubmit, onRecordHook, ...simplifiedProps } = props
  if (!sheets || sheets.length === 0)
    throw new Error(
      'You must provide at least one sheet to the SimplifiedWorkbook component'
    )
  const {
    sessionSpace,
    flatfileConfiguration,
    setFlatfileConfiguration,
    setOpen,
  } = useContext(FlatfileContext)

  useEffect(() => {
    setFlatfileConfiguration({
      ...flatfileConfiguration,
      sheet: sheets[0],
      onSubmit,
    })
  }, [])

  const onSubmitSettings = { ...DefaultSubmitSettings, ...props.submitSettings }
  // let simpleListener
  if (onSubmit || onRecordHook) {
    useListener((client) => {
      if (onRecordHook) {
        client.use(
          recordHook(
            sheets[0]?.slug || 'slug',
            async (
              record: FlatfileRecord,
              event: FlatfileEvent | undefined
            ) => {
              // @ts-ignore - something weird with the `data` prop and the types upstream in the packages being declared in different places, but overall this is fine
              return onRecordHook(record, event)
            }
          )
        )
      }
      if (onSubmit) {
        client.filter({ job: 'workbook:simpleSubmitAction' }, (configure) => {
          configure.on('job:ready', async (event) => {
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
          })
        })
      }
    }, [])
  }

  if (sessionSpace) {
    return (
      <EmbeddedIFrameWrapper
        handleCloseInstance={() => setOpen(false)}
        {...sessionSpace}
        {...simplifiedProps}
      />
    )
  }
}
