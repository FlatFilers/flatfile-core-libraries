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

const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()

  const [label, setLabel] = useState('Rock')

  useListener((listener) => {
    listener.on('**', (event) => {
      console.log('FFApp useListener Event => ', {
        topic: event.topic,
        payload: event.payload,
      })
    })
  })

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

  useEvent(
    'job:outcome-acknowledged',
    {
      operation: 'workbookSubmitAction',
      status: 'complete',
    },
    async (event) => {
      // any logic related to the event needed for closing the event
      console.log({ event })
      // close the portal iFrame window
      closePortal()
    }
  )

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
        <Document defaultPage={true} config={document} />
        <Workbook
          config={{
            ...workbook,
            name: "ALEX'S WORKBOOK",
          }}
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
            // defaultPage={true}
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
