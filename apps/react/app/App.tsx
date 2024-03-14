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
  Workbook,
} from '@flatfile/react'
import React, { useEffect, useState } from 'react'
import { listener as importedListener } from './listener'
import styles from './page.module.css'
import { recordHook } from '@flatfile/plugin-record-hook'
import api from '@flatfile/api'
// const ENVIRONMENT_ID = 'us_env_123456'
const PUBLISHABLE_KEY = 'pk_123456'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const FFApp = () => {
  const { open, openPortal, closePortal } = useFlatfile()

  const [label, setLabel] = useState('Rock')

  // useEffect(() => {
  //   console.log('FFApp useEffect', { flatfileConfiguration })
  //   setFlatfileConfiguration({...flatfileConfiguration, sidebarConfig: {
  //     showSidebar: true
  //   }})
  // }, [flatfileConfiguration])

  useListener((listener) => {
    // currentListener
    listener.on('**', (event) => {
      console.log('FFApp useListener Event => ', event.topic)
      // Handle the workbook:deleted event
    })
    // importedListener
  }, [])

  useListener(importedListener, [])

  useListener((client) => {
    client.use(
      recordHook('contacts', (record) => {
        const firstName = record.get('firstName')
        console.log({ firstName })
        // Gettign the real types here would be nice but seems tricky
        record.set('email', 'Rock')
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
        <button onClick={() => listenerConfig('blue')}>blue listener</button>
        <button onClick={() => listenerConfig('green')}>green listener</button>
      </div>
{/* 
      <Sheet config={sheet} />

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

      <Workbook workbook={workbook} document={document} />
    </div>
  )
}

const App = () => {
  return (
    <FlatfileProvider
      publishableKey={PUBLISHABLE_KEY}
      space={{
        metadata: {
          sidebarConfig: {
            showSidebar: true,
          },
        },
        namespace: 'test',
        name: 'Test Space',
      }}
    >
      <FFApp />
    </FlatfileProvider>
  )
}

export default App
