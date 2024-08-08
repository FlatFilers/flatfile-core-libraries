'use client'
import { document } from '@/utils/document'
import { workbook } from '@/utils/workbook'
import { recordHook } from '@flatfile/plugin-record-hook'
import {
  Document,
  Sheet,
  Space,
  useEvent,
  useFlatfile,
  useListener,
  usePlugin,
  Workbook,
} from '@flatfile/react'
import { useEffect, useState } from 'react'
import styles from './page.module.css'

const App = () => {
  function logClosed() {
    console.log('Flatfile Portal closed')
  }
  const { open, openPortal, closePortal } = useFlatfile({ onClose: logClosed })
  const [label, setLabel] = useState('Rock')
  const toggleOpen = () => {
    open ? closePortal({ reset: false }) : openPortal()
  }

  useEffect(() => {
    openPortal()
  }, [])

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

        record.set('lastName', 'Rocks')
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
        <button onClick={toggleOpen}>{open ? 'CLOSE' : 'OPEN'} PORTAL</button>
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
        <Document defaultPage config={document} />
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
            defaultPage
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
