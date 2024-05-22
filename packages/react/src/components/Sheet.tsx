import { Flatfile } from '@flatfile/api'
import {
  DefaultSubmitSettings,
  SimpleOnboarding
} from '@flatfile/embedded-utils'
import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import React, { useContext } from 'react'
import { useEvent, usePlugin } from '../hooks'
import { OnSubmitAction, workbookOnSubmitAction } from '../utils/constants'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'
import FlatfileContext from './FlatfileContext'

type SheetProps = {
  config: Flatfile.SheetConfig
  onSubmit?: SimpleOnboarding['onSubmit']
  submitSettings?: SimpleOnboarding['submitSettings']
  onRecordHook?: SimpleOnboarding['onRecordHook']
  defaultPage?: boolean
}

/**
 * `Sheet` component for Flatfile integration.
 *
 * This component allows you to integrate Flatfile's data import capabilities into your React application.
 * It provides a way to configure and handle the import process, including submitting data and handling records.
 *
 * @component
 * @example
 * const config = {
 *   name: 'Contacts',
 *   slug: 'contacts',
 *   fields: [
 *     { label: 'First Name', key: 'firstName', type: 'string', },
 *     { label: 'Last Name', key: 'lastName', type: 'string', },
 *     { label: 'Email', key: 'email', type: 'string', contraints: [{ type: 'unique' }] }
 *   ]
 * }
 *
 * const onSubmit = async (results) => {
 *   console.log('Data submitted:', results.data)
 * }
 *
 * const onRecordHook = async (record, event) => {
 *   if (!record.email.includes('@example.com')) {
 *     return {
 *       email: {
 *         value: record.email,
 *         info: `Only "@example.com" emails are allowed`,
 *         level: 'error'
 *       }
 *     }
 *   }
 * }
 *
 * <Sheet config={config} onSubmit={onSubmit} onRecordHook={onRecordHook} />
 *
 * @param {Object} props - Component props
 * @param {Flatfile.SheetConfig} props.config - Configuration for the Flatfile import
 * @param {Function} [props.onSubmit] - Callback function to handle data submission
 * @param {Object} [props.submitSettings] - Settings for data submission
 * @param {Function} [props.onRecordHook] - Callback function to handle record manipulation
 * @param {Boolean} [props.defaultPage] - Sets this as the default Page that the Space opens up to
 */

export const Sheet = (props: SheetProps) => {
  const { config, onRecordHook, onSubmit, submitSettings, defaultPage } = props
  const { addSheet, updateWorkbook, createSpace, setDefaultPage } =
    useContext(FlatfileContext)

  useDeepCompareEffect(() => {
    // Manage actions immutably
    if (onSubmit) {
      updateWorkbook({
        actions: [
          workbookOnSubmitAction(config.slug),
          ...(createSpace.workbook.actions || []),
        ],
      })
    }
    addSheet(config)
    if (defaultPage) {
      setDefaultPage({
        workbook: {
          sheet: config.slug,
        },
      })
    }
  }, [config, defaultPage])

  usePlugin(
    onRecordHook
      ? recordHook(
          config.slug ?? '**',
          async (record: FlatfileRecord, event: FlatfileEvent | undefined) => {
            return onRecordHook(record, event)
          }
        )
      : undefined,
    [config, onRecordHook]
  )

  useEvent(
    'job:ready',
    { job: `workbook:${workbookOnSubmitAction(config.slug).operation}` },
    onSubmit
      ? OnSubmitAction(onSubmit, {
          ...DefaultSubmitSettings,
          ...submitSettings,
        })
      : () => {}
  )
  return <></>
}
