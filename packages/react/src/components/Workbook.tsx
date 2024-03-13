import { FlatfileClient } from '@flatfile/api'
import type { Flatfile } from '@flatfile/api'
import { ISpace, JobHandler, SheetHandler } from '@flatfile/embedded-utils'
import { TRecordDataWithLinks, TPrimitive } from '@flatfile/hooks'
import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import React, { useState, useContext, useEffect } from 'react'
import { useListener } from '../hooks'
import ConfirmModal from './ConfirmCloseModal'
import FlatfileContext from './FlatfileContext'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'

const NewSpaceContents = (
  props: ISpace & {
    spaceId: string
    spaceUrl: string
    accessToken: string
    handleCloseInstance: () => void
    simple?: boolean
  }
): JSX.Element => {
  const [showExitWarnModal, setShowExitWarnModal] = useState(false)

  const { open } = useContext(FlatfileContext)
  const {
    spaceUrl,
    closeSpace,
    iframeStyles,
    mountElement = 'flatfile_iFrameContainer',
    exitText = 'Are you sure you want to exit? Any unsaved changes will be lost.',
    exitTitle = 'Close Window',
    exitPrimaryButtonText = 'Yes, exit',
    exitSecondaryButtonText = 'No, stay',
    displayAsModal = true,
    handleCloseInstance,
  } = props

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
            setShowExitWarnModal(false)
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

export const SimplifiedWorkbook = ({
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
  const {
    publishableKey,
    sessionSpace,
    apiUrl,
    flatfileConfiguration,
    setFlatfileConfiguration,
  } = useContext(FlatfileContext)

  useEffect(() => {
    setFlatfileConfiguration({
      ...flatfileConfiguration,
      sheet: sheets[0],
      onSubmit,
    })
  }, [sheets[0]])

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
            } catch (error: any) {
              console.error('Error:', error.stack)
              if (jobId) {
                await FlatfileAPI.jobs.cancel(jobId)
              }
              console.error('Error:', error.stack)
            }
          })
        })
      }
    }, [])
  }

  if (!!sessionSpace) {
    const { id: spaceId, guestLink: spaceUrl } = sessionSpace
    return (
      <NewSpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        sheet={sheets[0]}
        apiUrl={apiUrl}
        publishableKey={publishableKey}
        onSubmit={onSubmit}
        {...sessionSpace}
      />
    )
  }
}

export const Sheet = ({ config }: { config: Flatfile.SheetConfig }) => {
  const {
    publishableKey,
    sessionSpace,
    setOpen,
    apiUrl,
    flatfileConfiguration,
    setFlatfileConfiguration,
  } = useContext(FlatfileContext)

  useEffect(() => {
    setFlatfileConfiguration({
      ...flatfileConfiguration,
      sheet: config,
    })
  }, [config])

  if (sessionSpace) {
    const { id: spaceId, guestLink: spaceUrl } = sessionSpace
    return (
      <NewSpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        sheet={config}
        publishableKey={publishableKey}
        simple={true}
        handleCloseInstance={() => setOpen(false)}
        apiUrl={apiUrl}
        {...sessionSpace}
      />
    )
  }
}

export const Workbook = ({
  workbook,
  document,
}: {
  workbook: Flatfile.CreateWorkbookConfig
  document: Flatfile.DocumentConfig
}) => {
  const {
    publishableKey,
    sessionSpace,
    setOpen,
    apiUrl,
    flatfileConfiguration,
    setFlatfileConfiguration,
  } = useContext(FlatfileContext)

  useEffect(() => {
    setFlatfileConfiguration({
      ...flatfileConfiguration,
      workbook,
      document,
    })
  }, [workbook, document])

  if (sessionSpace) {
    const { id: spaceId, guestLink: spaceUrl } = sessionSpace
    return (
      <NewSpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        publishableKey={publishableKey}
        handleCloseInstance={() => setOpen(false)}
        apiUrl={apiUrl}
        {...sessionSpace}
      />
    )
  }
}
