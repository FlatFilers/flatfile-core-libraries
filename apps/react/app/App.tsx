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
import React, { useEffect, useState } from 'react'
import styles from './page.module.css'
import { recordHook } from '@flatfile/plugin-record-hook'

import api from '@flatfile/api'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()

  const [label, setLabel] = useState('Rock')

  useListener((listener) => {
    listener.on('**', (event) => {
      console.log('FFApp useListener Event => ', event.topic)
    })
  }, [])

  // Both of these also work:
  // FlatfileListener.create((client) => {
  // useListener(importedListener, [])

  // (listener: FlatfileListener) => {
  // useListener(plainListener, [])

  useListener((client) => {
    client.use(
      recordHook('contacts2', (record) => {
        const firstName = record.get('firstName')
        console.log({ firstName })

        record.set('lastName', 'Rock')
        return record
      })
    )
  }, [])

  usePlugin(
    recordHook('contacts', (record, event) => {
      console.log('recordHook', { event })
      record.set('lastName', label)
      return record
    }),
    [label]
  )

  useEvent('space:created', async ({ context: { spaceId } }) => {
    console.log('workbook:created')
    const { data: space } = await api.spaces.get(spaceId)
    console.log({ space })
  })

  useEvent('job:ready', { job: 'sheet:submitActionFg' }, async (event) => {
    const { jobId } = event.context
    try {
      await api.jobs.ack(jobId, {
        info: 'Getting started.',
        progress: 10,
      })

      // Make changes after cells in a Sheet have been updated
      console.log('Make changes here when an action is clicked')
      const records = await event.data

      console.log({ records })

      await api.jobs.complete(jobId, {
        outcome: {
          message: 'This is now complete.',
        },
      })

      // Probably a bad idea to close the portal here but just as an example
      await sleep(3000)
      closePortal()
    } catch (error: any) {
      console.error('Error:', error.stack)

      await api.jobs.fail(jobId, {
        outcome: {
          message: 'This job encountered an error.',
        },
      })
    }
  })

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
        <button onClick={() => setLabel('blue')}>blue listener</button>
        <button onClick={() => setLabel('green')}>green listener</button>
      </div>
      <Space
        config={{
          name: "Alex's Space",
          metadata: {
            sidebarConfig: {
              showSidebar: true,
            },
          },
        }}
      >
        <Document config={document} />
        <Workbook
          config={{ ...workbook, name: "ALEX'S WORKBOOK" }}
          onSubmit={async (sheet) => {
            console.log('on Workbook Submit ', { sheet })
          }}
          onRecordHooks={[
            [
              (record) => {
                record.set('email', 'SHEET 1 RECORDHOOKS')
                return record
              },
            ],
            [
              (record) => {
                record.set('email', 'SHEET 2 RECORDHOOKS')
                return record
              },
            ],
          ]}
        >
          <Sheet
            config={{
              ...workbook.sheets![0],
              slug: 'contacts3',
              name: 'Contacts 3',
            }}
            onRecordHook={(record) => {
              record.set('email', 'SHEET 3 RECORDHOOK')
              return record
            }}
            onSubmit={async (sheet) => {
              console.log('onSubmit from Sheet 3', { sheet })
            }}
          />
          <Sheet
            config={{
              ...workbook.sheets![0],
              slug: 'contacts4',
              name: 'Contacts 4',
            }}
            onRecordHook={(record) => {
              record.set('email', 'SHEET 4 RECORDHOOK')
              return record
            }}
            onSubmit={(sheet) => {
              console.log('onSubmit from Sheet 4', { sheet })
            }}
          />
        </Workbook>
      </Space>
    </div>
  )
}

export default App
