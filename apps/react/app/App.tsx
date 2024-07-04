'use client'
import { document } from '@/utils/document'
import { workbook } from '@/utils/workbook'
import { recordHook } from '@flatfile/plugin-record-hook'
import {
  Document,
  Sheet,
  Space,
  useEvent,
  useFlatfile,
  useListener,
  usePlugin,
  Workbook,
} from '@flatfile/react'
import { useEffect, useState } from 'react'
import styles from './page.module.css'

/**
 * @description Is responsible for rendering a Flatfile application with several
 * features such as useEffect, useListener, usePlugin and useEvent. It also defines
 * four buttons to trigger different actions related to opening, closing, and updating
 * the portal, as well as submitting workbooks and records.
 * 
 * @returns {Component} a React component that renders a Portal and several listeners
 * for event handling.
 */
const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()
  const [label, setLabel] = useState('Rock')
  /**
   * @description Either opens or closes a portal, depending on the value of `open`.
   */
  const toggleOpen = () => {
    open ? closePortal({ reset: false }) : openPortal()
  }

  useEffect(() => {
    openPortal()
  }, [])

  useListener((listener) => {
    listener.on('**', (event) => {
      console.log('FFApp useListener Event => ', {
        topic: event.topic,
        payload: event.payload,
      })
    })
  })

  // Both of these also work:
  // FlatfileListener.create((client) => {
  // useListener(importedListener, [])

  // (listener: FlatfileListener) => {
  // useListener(plainListener, [])

  useListener((client) => {
    client.use(
      recordHook('contacts2', (record) => {
        const firstName = record.get('firstName')
        console.log({ firstName })

        record.set('lastName', 'Rocks')
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

  useEvent(
    'job:outcome-acknowledged',
    {
      operation: 'workbookSubmitAction',
      status: 'complete',
    },
    async (event) => {
      // any logic related to the event needed for closing the event
      console.log({ event })
      // close the portal iFrame window
      closePortal()
    }
  )

  return (
    <div className={styles.main}>
      <div className={styles.description}>
        <button onClick={toggleOpen}>{open ? 'CLOSE' : 'OPEN'} PORTAL</button>
        <button onClick={() => setLabel('blue')}>blue listener</button>
        <button onClick={() => setLabel('green')}>green listener</button>
      </div>
      <Space
        config={{
          name: "Alex's Space",
          metadata: {
            sidebarConfig: {
              showSidebar: true,
            },
          },
        }}
      >
        <Document defaultPage config={document} />
        {/**
         * @description Configures and generates high-quality documentation for given code.
         * It accepts an object `workbook` with configuration properties, a `onSubmit` function
         * that logs information when called, and an `onRecordHooks` array of functions that
         * set property values on records before they are returned.
         * 
         * @param {object} config - configuration options for a specific worksheet, allowing
         * you to define properties such as the sheet name, slug, and record hooks.
         * 
         * @param {object} onSubmit - 3rd sheet that will receive the submitted data after
         * it has been processed and transformed.
         * 
         * @param {array} onRecordHooks - 2 record hook functions that are executed when a
         * record is inserted, updated, or deleted in the specified sheet.
         */}
        <Workbook
          config={{
            ...workbook,
            name: "ALEX'S WORKBOOK",
          }}
          onSubmit={async (sheet) => {
            console.log('on Workbook Submit ', { sheet })
          }}
          onRecordHooks={[
            [
              (record) => {
                record.set('email', 'SHEET 1 RECORDHOOKS')
                return record
              },
            ],
            [
              (record) => {
                record.set('email', 'SHEET 2 RECORDHOOKS')
                return record
              },
            ],
          ]}
        >
          {/**
           * @description Configures a Google Sheets document with a specific name and default
           * page, sets an onRecordHook function to update the "email" field with a custom
           * value, and defines an onSubmit function to log a message when the sheet is submitted.
           * 
           * @param {object} config - configuration for a specific worksheet, which includes
           * the sheet name, slug, and an optional onRecordHook function to manipulate records
           * before they are saved.
           * 
           * @param {asynchronous function.} onRecordHook - callback function that is triggered
           * when a new record is created or updated in the Sheet, which allows for custom
           * modifications to be applied to the recorded data before it is saved.
           * 
           * 	* `record`: The current record being processed in the hook, with properties
           * matching the corresponding fields in the sheet's data source.
           * 	* `sheet`: The active `Sheet` instance, used to access properties and methods for
           * interacting with the Google Sheets API.
           * 
           * @param {`async function`.} onSubmit - function that is executed when a record is
           * submitted in the Sheet 3.
           * 
           * 	* `onSubmit`: This is a function that will be called when a submit event occurs
           * on the sheet.
           * 	* `({ sheet })`: This is the event listener object that contains information about
           * the submitted sheet. The `{ sheet }` property refers to the sheet that was submitted.
           */}
          <Sheet
            defaultPage
            config={{
              ...workbook.sheets![0],
              slug: 'contacts3',
              name: 'Contacts 3',
            }}
            onRecordHook={(record) => {
              record.set('email', 'SHEET 3 RECORDHOOK')
              return record
            }}
            onSubmit={async (sheet) => {
              console.log('onSubmit from Sheet 3', { sheet })
            }}
          />
          {/**
           * @description Configures a new Google Sheets document with a specified slug, name,
           * and onRecordHook function to manipulate the contents of the sheet before it is
           * created. The `onSubmit` function logs information when the sheet is submitted.
           * 
           * @param {object} config - configuration for a new spreadsheet, including the slug
           * and name of the spreadsheet, as well as overwriting the email field with the value
           * `'SHEET 4 RECORDHOOK'`.
           * 
           * @param {Anonymous function.} onRecordHook - 4th sheet's record hook, which sets
           * the email field of each record to 'SHEET 4 RECORDHOOK'.
           * 
           * 	* `record`: A record object that contains information about the updated record.
           * 	* `SHEET 4 RECORDHOOK`: The email address specified as part of the onRecordHook
           * hook.
           * 
           * @param {object} onSubmit - action performed when a user submits data through the
           * sheet.
           */}
          <Sheet
            config={{
              ...workbook.sheets![0],
              slug: 'contacts4',
              name: 'Contacts 4',
            }}
            onRecordHook={(record) => {
              record.set('email', 'SHEET 4 RECORDHOOK')
              return record
            }}
            onSubmit={(sheet) => {
              console.log('onSubmit from Sheet 4', { sheet })
            }}
          />
        </Workbook>
      </Space>
    </div>
  )
}

export default App
