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
import { listener } from './listener'
import styles from './page.module.css'
import { recordHook } from '@flatfile/plugin-record-hook'
import { set } from 'lodash'

const ENVIRONMENT_ID = 'us_env_6fXBNCpi'
const PUBLISHABLE_KEY = 'pk_G3TDS1MdhufrWsZPvoqwIV6DFHq2PUSV'

const FFApp = () => {
  const { open, openPortal, closePortal, updateListener, listener } =
    useFlatfile()

  const [label, setLabel] = React.useState('Rock')

  useListener(
    (listener) => {
      listener.on('**', (event) => {
        console.log('initialListener Event => ', event.topic)
        // Handle the workbook:deleted event
      })
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
  
  useEvent('commit:created', (event) => {
    console.log('commit:created', { event })
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
    <FlatfileProvider pubKey={PUBLISHABLE_KEY} environmentId={ENVIRONMENT_ID}>
      <FFApp />
    </FlatfileProvider>
  )
}

export default App
