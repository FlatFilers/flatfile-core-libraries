import api, { Flatfile } from '@flatfile/api'
import {
  ISpace,
  JobHandler,
  SheetHandler,
  SpaceComponent,
  createWorkbookFromSheet,
} from '@flatfile/embedded-utils'
import React, { JSX, useContext, useEffect, useMemo, useState } from 'react'
import { useCreateListener } from '../hooks/useCreateListener'
import { addSpaceInfo } from '../utils/addSpaceInfo'
import { authenticate } from '../utils/authenticate'
import ConfirmModal from './ConfirmCloseModal'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'
import './style.scss'
import FlatfileContext from './FlatfileContext'
import { useFlatfileContext } from './FlatfileProvider'
import { TRecordDataWithLinks, TPrimitive } from '@flatfile/hooks'
import FlatfileListener, { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'

/**
 * @name Space
 * @description Flatfile Embedded Space component
 * @param props
 */

const Space = ({
  spaceId,
  spaceUrl,
  accessToken,
  handleCloseInstance,
  ...props
}: SpaceComponent &
  ISpace & { handleCloseInstance: () => void }): JSX.Element | null => {
  if (spaceId && spaceUrl && accessToken) {
    return (
      <SpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        accessToken={accessToken}
        handleCloseInstance={handleCloseInstance}
        {...props}
      />
    )
  }
  return null
}

export const SpaceContents = (
  props: ISpace & {
    spaceId: string
    spaceUrl: string
    accessToken: string
    handleCloseInstance: () => void
    simple?: boolean
  }
): JSX.Element => {
  const [showExitWarnModal, setShowExitWarnModal] = useState(false)
  // const context = useContext(FlatfileContext)
  const { open } = useContext(FlatfileContext)
  const {
    spaceId,
    spaceUrl,
    listener,
    accessToken,
    closeSpace,
    iframeStyles,
    mountElement = 'flatfile_iFrameContainer',
    exitText = 'Are you sure you want to exit? Any unsaved changes will be lost.',
    exitTitle = 'Close Window',
    exitPrimaryButtonText = 'Yes, exit',
    exitSecondaryButtonText = 'No, stay',
    apiUrl = 'https://platform.flatfile.com/api',
    displayAsModal = true,
    handleCloseInstance,
    simple,
  } = props
  console.log('SpaceContents', { simple })
  if (!simple) {
    const { dispatchEvent } = useCreateListener({
      listener,
      accessToken,
      apiUrl,
    })

    const handlePostMessage = (event: any) => {
      const { flatfileEvent } = event.data
      if (!flatfileEvent) return
      console.log('handlePostMessage', { flatfileEvent })
      if (
        flatfileEvent.topic === 'job:outcome-acknowledged' &&
        flatfileEvent.payload.status === 'complete' &&
        flatfileEvent.payload.operation === closeSpace?.operation
      ) {
        closeSpace?.onClose({})
      }
      dispatchEvent(flatfileEvent)
    }

    useEffect(() => {
      window.addEventListener('message', handlePostMessage, false)
      return () => {
        window.removeEventListener('message', handlePostMessage)
      }
    }, [listener])
  }

  const buildWorkbook = async () => {
    if (props.publishableKey) {
      console.log('buildWorkbook', { props })
      const fullAccessApi = authenticate(accessToken, apiUrl)
      await addSpaceInfo(props, spaceId, fullAccessApi)
    }
  }

  useEffect(() => {
    buildWorkbook()
  }, [])

  // useEffect(() => {
  //   console.log('SpaceContents useEffect', { open })
  // }, [open])

  return (
    <div
      className={`flatfile_iframe-wrapper ${
        displayAsModal ? 'flatfile_displayAsModal' : ''
      }`}
      style={{
        ...getContainerStyles(displayAsModal),
        display: open ? 'flex' : 'none',
      }}
      data-testid="space-contents"
    >
      {showExitWarnModal && (
        <ConfirmModal
          onConfirm={() => {
            handleCloseInstance()
            closeSpace?.onClose({})
          }}
          onCancel={() => setShowExitWarnModal(false)}
          exitText={exitText}
          exitTitle={exitTitle}
          exitPrimaryButtonText={exitPrimaryButtonText}
          exitSecondaryButtonText={exitSecondaryButtonText}
        />
      )}
      <iframe
        data-testid={mountElement}
        className={mountElement}
        style={getIframeStyles(iframeStyles!)}
        src={spaceUrl}
      />
      <button
        onClick={() => setShowExitWarnModal(true)}
        data-testid="flatfile-close-button"
        type="button"
        className="flatfile-close-button"
        style={{
          position: 'absolute',
          margin: '30px',
          top: '30px',
          right: '30px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 100 100"
          style={{ margin: 'auto' }}
        >
          <line
            x1="10"
            y1="10"
            x2="90"
            y2="90"
            stroke="white"
            strokeWidth="10"
          />
          <line
            x1="10"
            y1="90"
            x2="90"
            y2="10"
            stroke="white"
            strokeWidth="10"
          />
        </svg>
      </button>
    </div>
  )
}

export const Workbook = ({
  sheets,
  onSubmit,
  onRecordHook,
}: {
  sheets: any[]
  onSubmit?: ({
    data,
    sheet,
    job,
    event,
  }: {
    data?: any
    sheet?: any
    job?: any
    event?: FlatfileEvent
  }) => void
  onRecordHook?: (
    record: FlatfileRecord<TRecordDataWithLinks<TPrimitive>>,
    event?: FlatfileEvent
  ) => FlatfileRecord
}) => {
  const { pubKey } = useContext(FlatfileContext)
  const { space, open } = useFlatfileContext()

  useEffect(() => {
    console.log('Workbook useEffect', { space, open })
  }, [space, open])
  // console.log({ sheets })
  let listener
  if (onSubmit || onRecordHook) {
    listener = FlatfileListener.create((client: FlatfileListener) => {
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

              if (onSubmit) {
                await onSubmit({ job, sheet, event })
              }

              await api.jobs.complete(jobId, {
                outcome: {
                  message: 'complete',
                },
              })
            } catch (error: any) {
              console.error('Error:', error.stack)
              if (jobId) {
                await api.jobs.cancel(jobId)
              }
              console.error('Error:', error.stack)
            }
          })
        })
      }
    })
  }

  if (space) {
    const { id: spaceId, guestLink: spaceUrl } = space.data
    return (
      <SpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        sheet={sheets[0]}
        publishableKey={pubKey}
        onSubmit={onSubmit}
        listener={listener}
        {...space.data}
      />
    )
  }

  return <>Workbooks are neat</>
}

export const SimpleWorkbook = ({ sheets }: { sheets: any[] }) => {
  const { pubKey, space } = useContext(FlatfileContext)

  if (space) {
    const { id: spaceId, guestLink: spaceUrl } = space.data
    return (
      <SpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        sheet={sheets[0]}
        publishableKey={pubKey}
        simple={true}
        {...space.data}
      />
    )
  }

  return <>Workbooks are neat</>
}
export default Space
