'use client'
import { sheet } from '@/utils/sheet'
import {
  FlatfileProvider,
  useFlatfile,
  SimpleWorkbook,
  useListener,
  usePlugin,
  useEvent,
} from '@flatfile/react'
import React from 'react'
import { listener as importedListener } from './listener'
import styles from './page.module.css'
import { recordHook } from '@flatfile/plugin-record-hook'
import api from '@flatfile/api'

// const ENVIRONMENT_ID = 'us_env_123456'
const PUBLISHABLE_KEY = 'pk_123456'
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const FFApp = () => {
  const { open, openPortal, closePortal } = useFlatfile()

  const [label, setLabel] = React.useState('Rock')

  useListener(
    (listener) => {
      listener.on('**', (event) => {
        console.log('initialListener Event => ', event.topic)
        // Handle the workbook:deleted event
      })
      importedListener
    },
    [label]
  )

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
          OPEN PORTAL
        </button>
        <button onClick={() => listenerConfig('blue')}>blue listener</button>
        <button onClick={() => listenerConfig('green')}>green listener</button>
      </div>

      <SimpleWorkbook sheets={[sheet]} />
    </div>
  )
}

const App = () => {
  return (
    <FlatfileProvider publishableKey={PUBLISHABLE_KEY}>
      <FFApp />
    </FlatfileProvider>
  )
}

export default App
