'use client'
import { document } from '@/utils/document'
import { workbook } from '@/utils/workbook'
import { recordHook } from '@flatfile/plugin-record-hook'
import {
  attachStyleSheet,
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

attachStyleSheet({ nonce: 'flatfile-abc123' }) // add custom nonce

/**
 * @description Is a React component that provides a portal interface to Flatfile,
 * enabling listeners and plugins to interact with the portal. It renders a button
 * for opening or closing the portal and allows users to set the label of an listener
 * using a drop-down menu.
 * 
 * @returns {HTML div element} a React component that displays a portal with several
 * sheets, including a hooked sheet that sets an email field to a specific value.
 * 
 * 	* `<div className={styles.main}>` - This is the main container element for the
 * Flatfile application. It contains all the other elements.
 * 	* `<div className={styles.description}>` - This element contains buttons and
 * labels related to the portal. The button with the label "CLOSE" or "OPEN" opens
 * or closes the portal iFrame window, respectively. Two buttons with labels "blue
 * listener" and "green listener" are also present, which are not explained in this
 * output.
 * 	* `<button onClick={toggleOpen}>{open ? 'CLOSE' : 'OPEN'} PORTAL</button>` - This
 * button is used to toggle the state of the portal iFrame window. When the button
 * is clicked, the `toggleOpen` function is called, which in turn calls the `closePortal`
 * or `openPortal` function depending on the current state of the portal.
 * 	* `<button onClick={() => setLabel('blue')}>blue listener</button>` - This button
 * is used to set the label for the blue listener. When clicked, the `setLabel`
 * function is called with the value "blue".
 * 	* `<button onClick={() => setLabel('green')}>green listener</button>` - This
 * button is used to set the label for the green listener. When clicked, the `setLabel`
 * function is called with the value "green".
 * 	* `<Space config={...workbook}>` - This element contains the Flatfile workbook
 * instance and its configuration options. It renders the `Document` and `Workbook`
 * elements inside it.
 * 	* `<Document defaultPage config={document} />` - This element renders the Flatfile
 * document instance with the specified configuration options. The `defaultPage`
 * property specifies that the first page of the document should be rendered.
 * 	* `<Workbook config={{...workbook, name: 'Alex's Workbook', metadata: {...metadata,
 * sidebarConfig: {showSidebar: true}}}}>` - This element renders the Flatfile workbook
 * instance with the specified configuration options. The `name` property specifies
 * the name of the workbook, and the `metadata` property specifies the metadata for
 * the workbook. The `sidebarConfig` property specifies that the sidebar should be shown.
 * 	* `<Sheet config={{...sheet, slug: 'contacts3', name: 'Contacts 3'}}>` - This
 * element renders a single sheet inside the Flatfile workbook instance with the
 * specified configuration options. The `slug` property specifies the slug for the
 * sheet, and the `name` property specifies the display name of the sheet.
 * 	* `<Sheet onRecordHook={(record) => {...}}>` - This element is used to render a
 * single sheet inside the Flatfile workbook instance with a custom record hook. When
 * the hook is called, it takes the record as an argument and can perform any logic
 * needed for the record.
 * 	* `<Sheet onSubmit={async (sheet) => {...}}>` - This element is used to render a
 * single sheet inside the Flatfile workbook instance with a custom submit hook. When
 * the hook is called, it takes the sheet as an argument and can perform any logic
 * needed for the sheet.
 */
const App = () => {
  const { open, openPortal, closePortal } = useFlatfile()
  const [label, setLabel] = useState('Rock')
  /**
   * @description Updates the open state of a portal by calling either `closePortal`
   * or `openPortal`, depending on whether the `reset` parameter is set to `false`.
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
         * @description Generates high-quality documentation for given code and enables
         * submission and record hooks on separate sheets within the workbook.
         * 
         * @param {object} config - Workbook's configuration, which includes setting various
         * properties of the Workbook and its sheets, such as name, email, and record hooks.
         * 
         * @param {`AsyncFunction`.} onSubmit - 3rd sheet submitted by the user, which will
         * log the sheet's data to the console in a structured format using `{ sheet }`.
         * 
         * 	* `async (sheet) => { console.log('onSubmit from', { sheet }); }`: This is an
         * asynchronous function that logs a message to the console with the `onSubmit`
         * function as an argument, along with its parameters (`{ sheet }`). The `console.log()`
         * statement will execute after the `onSubmit` function is called, and it will log
         * the value of `sheet`.
         * 	* `config={{ ...workbook, name: 'ALEX’S WORKBOOK' }}`: This sets the `name`
         * property of the `Workbook` configuration to `'ALEX’S WORKBOOK'`.
         * 
         * @param {object} onRecordHooks - 2-dimensional array of record hook functions for
         * each sheet in the workbook, where each function updates the `email` property of
         * the records before they are saved to the corresponding sheet.
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
           * @description Defines a new sheet with the given default page and configuration,
           * and sets an onRecordHook to modify email values for records, and an onSubmit hook
           * to log information when the sheet is submitted.
           * 
           * @param {object} config - configuration for a new worksheet, including its slug and
           * name, and overrides any defaults provided by the `workbook` object.
           * 
           * @param {asynchronous function that returns a/an Google Sheets record.} onRecordHook
           * - 4-ary function that gets called each time a new record is created or updated
           * within the `Contacts3` sheet, allowing you to perform arbitrary actions on the
           * newly created or updated records before they are persisted in the underlying storage.
           * 
           * 	* `(record) => {...}` denotes an inline hook that performs actions on the current
           * record.
           * 	* `record.set('email', 'SHEET 3 RECORDHOOK')` modifies the `email` field of the
           * current record by setting it to `'SHEET 3 RECORDHOOK'`.
           * 
           * @param {object} onSubmit - callback function that is triggered when the changes
           * made to the sheet are committed or saved.
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
           * @description Sets up a Google Sheets document with configuration for sheet 4,
           * including setting an onRecordHook function to update a record's email field, and
           * an onSubmit function to log information about the submitted sheet.
           * 
           * @param {object} config - 0th sheet of the workbook, providing its slug and name.
           * 
           * @param {functions reference.} onRecordHook - function to be called when a new
           * record is created, where it sets the 'email' field of the record to `'SHEET 4 RECORDHOOK'`.
           * 
           * 	* `(record)`: The current record being processed in the hook. It is an object
           * with fields corresponding to the defined `onRecordHook` schema.
           * 	* `'SHEET 4 RECORDHOOK'`: The value of the `email` field for the current record.
           * 
           * @param {object} onSubmit - `console.log` statement, which will log an event
           * notification to the console whenever a change is made in sheet 4.
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
