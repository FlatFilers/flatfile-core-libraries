'use client'
import { useFlatfile, useListener, useEvent, Space } from '@flatfile/react'
import React from 'react'
import styles from '../page.module.css'
import { recordHook } from '@flatfile/plugin-record-hook'
import api from '@flatfile/api'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()

  useListener((listener) => {
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

  const SPACE_ID = process.env.NEXT_PUBLIC_FLATFILE_SPACE_ID
  if (!SPACE_ID) return <>No SPACE_ID Available</>

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
      </div>
      <Space
        id={SPACE_ID}
        config={{
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

export default App
