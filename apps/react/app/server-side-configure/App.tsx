'use client'
import { sheet } from '@/utils/sheet'
import { useFlatfile, useEvent, Sheet, Workbook, Space } from '@flatfile/react'
import React from 'react'
import styles from '../page.module.css'
const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()

  useEvent('**', async (event) => {
    console.group('Event ->', event.topic)
    console.log({ event })
    console.groupEnd()
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
      </div>
      <Space
        config={{
          name: 'Green Space',
          metadata: {
            showSidebar: true,
          },
        }}
      />
    </div>
  )
}

export default App
