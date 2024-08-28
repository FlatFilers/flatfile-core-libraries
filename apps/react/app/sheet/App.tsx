'use client'
import { sheet } from '@/utils/sheet'
import { useFlatfile, useEvent, Sheet, Workbook, Space } from '@flatfile/react'
import React, { useState } from 'react'
import styles from '../page.module.css'
const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()
  const [sheetConfig, setSheetConfig] = useState(sheet)

  const setSheet = (number: number) => {
    setSheetConfig({
      ...sheet,
      name: `Sheet ${number}`,
      slug: `sheet-${number}`,
      fields: [
        ...sheet.fields,
        {
          key: `email-${number}`,
          type: 'string',
          label: `Email ${number}`,
          config: undefined,
        },
      ],
    })
  }
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
        <button
          onClick={() => {
            setSheet(2)
          }}
        >
          Set Sheet 2
        </button>
        <button
          onClick={() => {
            setSheet(3)
          }}
        >
          Set Sheet 3
        </button>
      </div>

      <Sheet
        defaultPage={true}
        config={sheetConfig}
        onRecordHook={(record) => {
          const email = record.get('email')
          if (!email) {
            record.addError('email', 'Gotta add an Email here!')
          }
          return record
        }}
        onSubmit={(sheet) => {
          console.log('onSubmit from Sheet Action', { sheet })
        }}
      />

      <Sheet
        config={{...sheet, slug: 'second-sheet', name: 'Second Sheet'}}
        onRecordHook={(record) => {
          const email = record.get('email')
          if (!email) {
            record.addError('email', 'Gotta add an Email here!')
          }
          return record
        }}
      />
    </div>
  )
}

export default App
