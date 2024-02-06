'use client'
import { sheet } from '@/utils/sheet'
import { InitSpace, initializeFlatfile, usePortal } from '@flatfile/react'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { config } from './config'
import { listener } from './listener'
import styles from './page.module.css'

const SPACE_ID = 'us_sp_123456'
const ENVIRONMENT_ID = 'us_env_O60vqdol'
const PUBLISHABLE_KEY = 'pk_3626978e5f52480085a37844166d347a'

const spaceProps = {
  environmentId: ENVIRONMENT_ID,
  iframeStyles: {
    borderRadius: '12px',
    width: '100%',
    height: '750px',
    borderWidth: ' 0px',
    background: 'rgb(255, 255, 255)',
    padding: '16px',
  },
  listener: listener,
  publishableKey: PUBLISHABLE_KEY,
  workbook: config,
}

const simplifiedProps = {
  environmentId: ENVIRONMENT_ID,
  publishableKey: PUBLISHABLE_KEY,
  sheet: sheet,
}

const LoadingComponent = () => <label>Loading data....</label>

function App() {
  const [showSpace, setShowSpace] = useState(false)
  const [showSimplified, setShowSimplified] = useState(false)
  const [activatePreloaded, setActivatePreloaded] = useState(false)

  const { Space, OpenEmbed } = initializeFlatfile({
    ...spaceProps,
    loading: <LoadingComponent />,
    exitPrimaryButtonText: 'CLOSE!',
    exitSecondaryButtonText: 'KEEP IT!',
  })

  const SimpleSpace = ({
    setShowSpace,
  }: {
    setShowSpace: Dispatch<SetStateAction<boolean>>
  }) => {
    const portal = usePortal({
      ...simplifiedProps,
      onSubmit: async ({
        job,
        sheet,
      }: {
        job?: any
        sheet?: any
      }): Promise<any> => {
        const data = await sheet.allData()
        console.log('onSubmit', data)
      },
      onRecordHook: (record: any, event: any) => {
        const firstName = record.get('firstName')
        const lastName = record.get('lastName')
        if (firstName && !lastName) {
          record.set('lastName', 'Rock')
          record.addInfo('lastName', 'Welcome to the Rock fam')
        }
        return record
      },
    })
    return portal
  }

  return (
    <div className={styles.main}>
      <div className={styles.description}>
        <button
          onClick={async () => {
            setShowSpace(!showSpace)
            await OpenEmbed()
          }}
        >
          {showSpace === true ? 'Close' : 'Open'} space
        </button>
      </div>
      <div className={styles.description}>
        <button
          onClick={() => {
            setShowSimplified(!showSimplified)
          }}
        >
          {showSimplified === true ? 'Close' : 'Open'} Simplified
        </button>
      </div>
      <div className={styles.description}>
        <button
          onClick={() => {
            setActivatePreloaded(!showSimplified)
          }}
        >
          {showSimplified === true ? 'Close' : 'Open'} Pre-loaded
        </button>
      </div>
          <Space />
      {showSimplified && (
        <div>
          <SimpleSpace setShowSpace={setShowSimplified} />
        </div>
      )}
      <InitSpace
        {...spaceProps}
        activated={activatePreloaded}
        loading={<LoadingComponent />}
        exitPrimaryButtonText={'CLOSE!'}
        exitSecondaryButtonText={'KEEP IT!'}
        closeSpace={{
          operation: 'contacts:submit',
          onClose: () => setActivatePreloaded(false),
        }}
      />
    </div>
  )
}

export default App
