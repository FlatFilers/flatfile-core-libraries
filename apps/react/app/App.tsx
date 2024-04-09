'use client'
import { workbook } from '@/utils/workbook'
import { document } from '@/utils/document'
import {
  useFlatfile,
  useListener,
  usePlugin,
  useEvent,
  Workbook,
  Space,
  Document,
  Sheet,
} from '@flatfile/react'
import React, { useState } from 'react'
import styles from './page.module.css'
import { recordHook } from '@flatfile/plugin-record-hook'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()

  const [label, setLabel] = useState('Rock')

  // useListener((listener) => {
  //   // currentListener
  //   listener.on('**', (event) => {
  //     console.log('FFApp useListener Event => ', event.topic)
  //     // Handle the workbook:deleted event
  //   })
  // }, [])

  // Both of these also work:
  // FlatfileListener.create((client) => {
  // useListener(importedListener, [])

  // (listener: FlatfileListener) => {
  // useListener(plainListener, [])

  // useListener((client) => {
  //   client.use(
  //     recordHook('contacts', (record) => {
  //       const firstName = record.get('firstName')
  //       console.log({ firstName })
  //       // Gettign the real types here would be nice but seems tricky
  //       record.set('email', 'Rock')
  //       return record
  //     })
  //   )
  // }, [])

  // usePlugin(
  //   recordHook('contacts', (record, event) => {
  //     console.log('recordHook', { event })
  //     record.set('lastName', label)
  //     return record
  //   }),
  //   [label]
  // )

  // useEvent('workbook:created', (event) => {
  //   console.log('workbook:created', { event })
  // })

  // useEvent('**', (event) => {
  //   console.log({ event })
  // })

  // useEvent('job:ready', { job: 'sheet:submitActionFg' }, async (event) => {
  //   const { jobId } = event.context
  //   try {
  //     await api.jobs.ack(jobId, {
  //       info: 'Getting started.',
  //       progress: 10,
  //     })

  //     // Make changes after cells in a Sheet have been updated
  //     console.log('Make changes here when an action is clicked')
  //     const records = await event.data

  //     console.log({ records })

  //     await api.jobs.complete(jobId, {
  //       outcome: {
  //         message: 'This is now complete.',
  //       },
  //     })

  //     // Probably a bad idea to close the portal here but just as an example
  //     await sleep(3000)
  //     closePortal()
  //   } catch (error: any) {
  //     console.error('Error:', error.stack)

  //     await api.jobs.fail(jobId, {
  //       outcome: {
  //         message: 'This job encountered an error.',
  //       },
  //     })
  //   }
  // })

  const listenerConfig = (label: string) => {
    setLabel(label)
  }
  return (
    <div className={styles.main}>
      <div className={styles.description}>
        <button
          onClick={() => {
            open ? closePortal() : openPortal()
          }}
        >
          {open ? 'CLOSE' : 'OPEN'} PORTAL
        </button>
        <button onClick={() => listenerConfig('blue')}>blue listener</button>
        <button onClick={() => listenerConfig('green')}>green listener</button>
      </div>
      <Space
        config={{
          metadata: {
            sidebarConfig: {
              showSidebar: true,
            },
          },
        }}
      >
        <Document config={document} />
        <Workbook
          config={workbook}
          onSubmit={async (sheet) => {
            console.log('onSubmit', { sheet })
          }}
          onRecordHooks={[
            [
              'contacts',
              (record) => {
                record.set('email', 'SHEET 1')
                return record
              },
            ],
            [
              'contacts',
              (record) => {
                record.set('lastName', 'SHEET 3')
                return record
              },
            ],
          ]}
        />
        {/* <Sheet
          config={workbook.sheets![0]}
          onSubmit={(sheet) => {
            console.log('onSubmit', { sheet })
          }}
        /> */}
      </Space>
    </div>
  )
}

export default App
