import React, { JSX, useEffect, useState } from 'react'
import DefaultError from '../components/Error'
import Space from '../components/Space'
import Spinner from '../components/Spinner'
import {
  State,
  JobHandler,
  SheetHandler,
  createWorkbookFromSheet,
  DefaultSubmitSettings,
} from '@flatfile/embedded-utils'
import { initializeSpace } from '../utils/initializeSpace'
import { getSpace } from '../utils/getSpace'
import { FlatfileRecord } from '@flatfile/hooks'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { IReactSimpleOnboarding } from '../types/IReactSimpleOnboarding'
import api from '@flatfile/api'

export const usePortal = (props: IReactSimpleOnboarding): JSX.Element => {
  const { errorTitle, loading: LoadingElement, apiUrl } = props
  const [initError, setInitError] = useState<string>()
  const [state, setState] = useState<State>({
    localSpaceId: '',
    accessTokenLocal: '',
    spaceUrl: '',
  })
  const [flatfileOptions, setFlatfileOptions] = useState(props)

  const { localSpaceId, spaceUrl, accessTokenLocal } = state
  const onSubmitSettings = { ...DefaultSubmitSettings, ...props.submitSettings }
  const initSpace = async () => {
    let config = props
    try {
      if (!config.workbook && config.sheet) {
        config.workbook = createWorkbookFromSheet(
          config.sheet,
          !!props.onSubmit
        )
        if (!config.listener && (config.onSubmit || config.onRecordHook)) {
          config.listener = FlatfileListener.create(
            (client: FlatfileListener) => {
              if (config.onRecordHook) {
                client.use(
                  recordHook(
                    config.sheet?.slug || 'slug',
                    async (
                      record: FlatfileRecord,
                      event: FlatfileEvent | undefined
                    ) => {
                      // @ts-ignore - something weird with the `data` prop and the types upstream in the packages being declared in different places, but overall this is fine
                      return config.onRecordHook(record, event)
                    }
                  )
                )
              }
              if (config.onSubmit) {
                client.filter(
                  { job: 'workbook:simpleSubmitAction' },
                  (configure) => {
                    configure.on('job:ready', async (event) => {
                      const { jobId, spaceId, workbookId } = event.context
                      try {
                        await api.jobs.ack(jobId, {
                          info: 'Starting job',
                          progress: 10,
                        })

                        const job = new JobHandler(jobId)
                        const { data: workbookSheets } = await api.sheets.list({
                          workbookId,
                        })

                        // this assumes we are only allowing 1 sheet here (which we've talked about doing initially)
                        const sheet = new SheetHandler(workbookSheets[0].id)

                        if (config.onSubmit) {
                          await config.onSubmit({ job, sheet, event })
                        }

                        await api.jobs.complete(jobId, {
                          outcome: {
                            message: 'complete',
                          },
                        })
                        if (onSubmitSettings.deleteSpaceAfterSubmit) {
                          await api.spaces.archiveSpace(spaceId)
                        }
                      } catch (error: any) {
                        console.error('Error:', error.stack)
                        if (jobId) {
                          await api.jobs.cancel(jobId)
                        }
                        console.error('Error:', error.stack)
                      }
                    })
                  }
                )
              }
            }
          )
        }
      }
      const { data } = props.publishableKey
        ? await initializeSpace(config)
        : await getSpace(config)

      if (!data) {
        throw new Error('Failed to initialize space')
      }

      const { id: spaceId, accessToken, guestLink } = data

      if (!spaceId) {
        throw new Error('Missing spaceId from space response')
      }

      if (!guestLink) {
        throw new Error('Missing guest link from space response')
      }

      setState((prevState) => ({
        ...prevState,
        localSpaceId: spaceId,
        spaceUrl: guestLink,
      }))

      if (!accessToken) {
        throw new Error('Missing access token from space response')
      }

      setState((prevState) => ({
        ...prevState,
        accessTokenLocal: accessToken,
      }))
      setFlatfileOptions(config)
    } catch (error: any) {
      setInitError(error)
    }
  }

  useEffect(() => {
    initSpace()
  }, [])

  const errorElement = <DefaultError error={errorTitle || initError!} />

  const loadingElement = LoadingElement ?? (
    <div style={{ margin: '16px' }}>
      <Spinner />
    </div>
  )

  if (initError) {
    return errorElement
  }

  if (localSpaceId && spaceUrl && accessTokenLocal) {
    return (
      <Space
        key={localSpaceId}
        spaceId={localSpaceId}
        spaceUrl={spaceUrl}
        accessToken={accessTokenLocal}
        {...flatfileOptions}
      />
    )
  }

  return loadingElement
}

export default usePortal
