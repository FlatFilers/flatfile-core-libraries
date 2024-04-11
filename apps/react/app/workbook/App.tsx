'use client'
import { workbook } from '@/utils/workbook'
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

      <Workbook
        config={workbook}
        onSubmit={async (sheet) => {
          console.log('on Workbook Submit ', { sheet })
        }}
        onRecordHooks={[
          [
            'contacts',
            (record) => {
              record.set('email', 'SHEET 1 RECORDHOOKS')
              return record
            },
          ],
          [
            'contacts2',
            (record) => {
              record.set('email', 'SHEET 2 RECORDHOOKS')
              return record
            },
          ],
        ]}
      />
    </div>
  )
}

export default App
