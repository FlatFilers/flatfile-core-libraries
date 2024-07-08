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
 * @description Generates high-quality documentation for given code by using different
 * listeners and plugins to log events and handle submissions, and by creating a
 * portal iFrame window that can be opened or closed.
 * 
 * @returns {Component} a React component that renders a portal and various listeners
 * for event handling.
 */
const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()
  const [label, setLabel] = useState('Rock')
  /**
   * @description Either opens or closes a portal based on the provided `open` state.
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
         * @description Generates high-quality documentation for code given to it, including
         * information on sheets submitted or recorded hooks.
         * 
         * @param {object} config - Workbook configuration object, which defines various
         * properties of the Workbook such as its name, onSubmit event handler, and record
         * hooks for each sheet.
         * 
         * @param {`AsyncFunction`.} onSubmit - 2nd sheet's onSubmit callback, which logs
         * information to the console when called.
         * 
         * 	* `onSubmit`: This function takes an argument called `sheet` which is an instance
         * of the `Sheet` class.
         * 	* `async`: This indicates that the function returns a promise.
         * 	* `{ console.log('onWorkbookSubmission', sheet ) }`: This line logs a message to
         * the console with the `sheet` object as its argument whenever the `onSubmit` function
         * is called.
         * 
         * @param {object} onRecordHooks - 2-element array of hook functions that will be
         * called for each record when the Sheet is submitted or updated.
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
           * @description Generates high-quality documentation for code given to it. In this
           * case, it creates a new sheet with a name and slug specified, sets an onRecordHook
           * to modify record data, and an onSubmit hook to log the submitted sheet information
           * to the console.
           * 
           * @param {object} config - configuration for a specific sheet, which includes setting
           * the sheet name and overriding certain properties of the `workbook` object.
           * 
           * @param {Anonymous Function.} onRecordHook - 1-time function that gets executed
           * after each record is transformed into an Immutable record, resulting in an updated
           * Immutable record with modified email property set to 'SHEET 3 RECORDHOOK'.
           * 
           * 	* `record`: The recorded data in the sheet. It is an object with the following
           * structure: `record => { email: string }`.
           * 	* `sheet`: The `Sheet` instance itself, which contains additional metadata and
           * configuration options for the sheet.
           * 
           * @param {asynchronous function.} onSubmit - occurrence of a user submitting information
           * through the Sheet 3 form, and when it is triggered, it logs an information message
           * containing the sheet's data to the console.
           * 
           * 	* `onSubmit`: A function that gets called when the sheet is submitted. The function
           * takes the updated sheet as an argument (`{sheet}`) in the shape of an object
           * containing the latest values for each record.
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
           * @description Sets up a new Google Sheets spreadsheet with a custom slug, name, and
           * hooks for records and submissions.
           * 
           * @param {object} config - configuration for the generated documentation, including
           * the slug and name of the new sheet, as well as specifying the hook function for
           * recording and submitting records.
           * 
           * @param {Anonymous Function.} onRecordHook - function to execute on each record
           * when it is hooked, and in this case, the function modifies the `email` field of
           * the record by adding the string " SHEET 4 RECORDHOOK".
           * 
           * 	* `record`: The updated record that is being hooked on to after being serialized
           * and sent to the server for processing. Its value is a ` Record <string, any> `.
           * 	* `set(key: string, value: any)`: A function that updates the specified property
           * of the record with the provided value. The keys are assumed to be valid string
           * identifiers of properties in a JSON object.
           * 
           * @param {object} onSubmit - sheet that is submitted after a record has been modified
           * in the specified hook.
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
