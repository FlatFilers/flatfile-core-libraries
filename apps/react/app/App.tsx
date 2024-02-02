'use client'
import { sheet } from '@/utils/sheet'
import {
  FlatfileProvider,
  useFlatfile,
  Workbook,
  SimpleWorkbook,
  useListener,
  usePlugin,
} from '@flatfile/react'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { config } from './config'
import { listener } from './listener'
import styles from './page.module.css'
import { recordHook } from '@flatfile/plugin-record-hook'
import FlatfileListener from '@flatfile/listener'

const ENVIRONMENT_ID = 'us_env_6fXBNCpi'
const PUBLISHABLE_KEY = 'pk_G3TDS1MdhufrWsZPvoqwIV6DFHq2PUSV'

const simplifiedProps = {
  environmentId: ENVIRONMENT_ID,
  publishableKey: PUBLISHABLE_KEY,
  sheet: sheet,
}

const FFApp = () => {
  const { open, openPortal, closePortal, updateListener, listener } =
    useFlatfile()

  useListener((listener) => {
    listener.on('**', (event) => {
      console.log('initialListener Event => ', event.topic)
      // Handle the workbook:deleted event
    })
  }, [])

  usePlugin(
    recordHook('contacts', (record, event) => {
      console.log('recordHook', { event })
      // ?? can we unsub event lsitener
      record.set('lastName', 'Rock')
      return record
    }),
    [listener]
  )

  const listenerConfig = (label: string) => {
    updateListener((updatedListener) => {
      updatedListener.on('**', (event) => {
        // handle the event
        console.log(`Listener ${label} Event => `, event.topic)
      })
    })
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
