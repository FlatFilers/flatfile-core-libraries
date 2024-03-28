'use client'
import { sheet } from '@/utils/sheet'
import { workbook } from '@/utils/workbook'
import { document } from '@/utils/document'
import {
  FlatfileProvider,
  useFlatfile,
  Sheet,
  useListener,
  usePlugin,
  useEvent,
  SimplifiedWorkbook,
  CombinedWorkbook,
  Workbook,
  Space,
  Document,
} from '@flatfile/react'
import React, { useEffect, useState } from 'react'
import { listener as importedListener, plainListener } from './listener'
import styles from './page.module.css'
import { recordHook } from '@flatfile/plugin-record-hook'
import api from '@flatfile/api'
import { metadata } from './layout'

const PUBLISHABLE_KEY = 'pk_123456'
const ACCESS_TOKEN = 'ey.123445'
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const FFApp = () => {
  const { open, openPortal, closePortal } = useFlatfile()

  const [label, setLabel] = useState('Rock')

  useListener((listener) => {
    // currentListener
    listener.on('**', (event) => {
      console.log('FFApp useListener Event => ', event.topic)
      // Handle the workbook:deleted event
    })
  }, [])

  // Both of these work:
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

  useEvent('workbook:created', (event) => {
    console.log('workbook:created', { event })
  })

  useEvent('*:created', (event) => {
    console.log({ topic: event.topic })
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
        {/* <button onClick={() => listenerConfig('blue')}>blue listener</button>
        <button onClick={() => listenerConfig('green')}>green listener</button> */}
      </div>

      {/* <Sheet config={sheet} /> */}
      {/* 
      <SimplifiedWorkbook
        sheets={[sheet]}
        onRecordHook={(record, event) => {
          console.log('onRecordHook', { record, event })
          record.set('email', 'alex@nasa.com')
          return record
        }}
        onSubmit={({ data, sheet, job, event }) => {
          console.log('onSubmit', { data, sheet, job, event })
        }}
      /> */}

      {/* <Workbook workbook={workbook} />
      <CombinedWorkbook
        sheets={[sheet]}
        onRecordHook={(record, event) => {
          console.log('onRecordHook', { record, event })
          record.set('email', 'alex@nasa.com')
          return record
        }}
        onRecordHooks={[
          [
            'slug',
            (record, event) => {
              console.log('onRecordHook', { record, event })
              record.set('email', 'alex@nasa.com')
              return record
            },
          ],
          [
            (record, event) => {
              console.log('onRecordHook', { record, event })
              record.set('email', 'alex@nasa.com')
              return record
            },
          ],
        ]}
      /> */}
      {/* <CombinedWorkbook
        {...workbook}
        // sheets={[sheet, { ...sheet, name: 'Contacts 2', slug: 'contacts2' }]}
        onRecordHooks={[
          [
            (record, event) => {
              console.log('onRecordHook', { record, event })
              record.set('email', 'alex@contacts.com')
              return record
            },
          ],
          [
            (record, event) => {
              console.log('onRecordHook', { record, event })
              record.set('email', 'alex@contacts2.com')
              return record
            },
          ],
        ]}
      />
      <CombinedWorkbook
        {...workbook}
        // sheets={[sheet, { ...sheet, name: 'Contacts 2', slug: 'contacts2' }]}
        onRecordHooks={[
          [
            (record, event) => {
              console.log('onRecordHook', { record, event })
              record.set('email', 'alex@contacts.com')
              return record
            },
          ],
          [
            (record, event) => {
              console.log('onRecordHook', { record, event })
              record.set('email', 'alex@contacts2.com')
              return record
            },
          ],
        ]}
      /> */}
      {/* <Workbook {...workbook} sheets={undefined}> */}
      {/* <Sheet
        config={sheet}
        onRecordHook={(record) => {
          record.set('email', 'TEST SHEET RECORD')
          return record
        }}
        onSubmit={(sheet) => {
          console.log('onSubmit', { sheet })
        }}
      />
      <Sheet
        config={workbook.sheets![1]}
        onRecordHook={(record) => {
          record.set('email', 'TEST SHEET RECORD')
          return record
        }}
        onSubmit={(sheet) => {
          console.log('onSubmit', { sheet })
        }}
      />
      {/* <Sheet config={workbook.sheets![1]} />
      </Workbook> */}
      {/* <Space
        config={{
          namespace: 'alex-2',
          metadata: {
            sidebarConfig: {
              showSidebar: true,
            },
          },
          name: 'Test Space',
        }}
      > */}
      {/* <Document config={document} />
      <NewSpace
        config={{
          metadata: {
            sidebarConfig: {
              showSidebar: true,
            },
          },
        }}
      >
        <Workbook
          config={workbook}
          onSubmit={(sheet) => {
            console.log('onSubmit', { sheet })
          }}
        >
          <Sheet
            config={sheet}
            onRecordHook={(record) => {
              record.set('email', 'TEST SHEET RECORD')
              return record
            }}
          />
          <Sheet config={{ ...sheet, name: 'Contacts 2', slug: 'contacts2' }} />
        </Workbook>
      </NewSpace> */}
      <Space
        config={{
          id: 'us_sp_GfO7IfNM',
          metadata: {
            sidebarConfig: {
              showSidebar: true,
            },
          },
        }}
      />
    </div>
  )
}

const App = () => {
  return (
    <FlatfileProvider
      // Just `key` and accept PURCHASED_KEY, ACCESS_TOKEN, SECRET_KEY (but not securely)?
      // publishableKey={PUBLISHABLE_KEY}
      accessToken={ACCESS_TOKEN}
      // space={
      //   {
      //     // id: 'us_sp_123456',
      //     // accessToken: 'ey123456.ey123456',
      //   }
      // }
      options={{
        mountElement: 'alex-rock',
        exitText: 'Alex',
        exitTitle: 'Alex',
        exitPrimaryButtonText: 'Alex',
        exitSecondaryButtonText: 'Alex',
        displayAsModal: true,
        closeSpace: {
          operation: 'closeSpace',
          onClose: () => {
            console.log('onClose')
          },
        },
      }}
    >
      <FFApp />
    </FlatfileProvider>
  )
}

export default App
