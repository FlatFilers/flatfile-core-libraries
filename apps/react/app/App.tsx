'use client'
import { sheet } from '@/utils/sheet'
import {
  InitSpace,
  initializeFlatfile,
  usePortal,
  FlatfileProvider,
  useFlatfile,
  Workbook,
} from '@flatfile/react'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { config } from './config'
import { listener } from './listener'
import styles from './page.module.css'

const ENVIRONMENT_ID = 'us_env_6fXBNCpi'
const PUBLISHABLE_KEY = 'pk_G3TDS1MdhufrWsZPvoqwIV6DFHq2PUSV'

const simplifiedProps = {
  environmentId: ENVIRONMENT_ID,
  publishableKey: PUBLISHABLE_KEY,
  sheet: sheet,
}
const onSubmit = async ({
  job,
  sheet,
}: {
  job?: any,
  sheet?: any
}): Promise<any> => {
  const data = await sheet.allData()
  console.log('onSubmit', data)
}

const onRecordHook = (record: any, event: any) => {
  const firstName = record.get('firstName')
  const lastName = record.get('lastName')
  if (firstName && !lastName) {
    record.set('lastName', 'Rock')
    record.addInfo('lastName', 'Welcome to the Rock fam')
  }
  return record
}


const FFApp = () => {
  const { open, openPortal, closePortal } = useFlatfile()
  
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
      </div>

      <Workbook
        sheets={[sheet]}
        onRecordHook={onRecordHook}
        onSubmit={onSubmit}
      />
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
