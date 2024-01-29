import { FlatfileListener } from '@flatfile/listener'

import { Validator } from '../logic/validator'
import { getSheetConfigFromSession } from '../logic/get.sheet.config.from.session'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import { recordToDictionary } from '../logic/record.hook'

/**
 * Implement the v2 validator shims on any migrated schema
 *
 * @todo Carl should add an e2e test here
 * @param sheetSlug
 */
export function validators(sheetSlug: string) {
  return (listener: FlatfileListener) => {
    listener.use(
      bulkRecordHook(sheetSlug, async (records, event) => {
        const sheetId = event?.context.sheetId

        const sheetSessionKey = `sheetConfig-${sheetId}`
        const sheetConfig = await getSheetConfigFromSession(
          sheetSessionKey,
          sheetId
        )
        const validator = new Validator(sheetConfig)

        records.forEach((record) => {
          const results = validator.validateRow(recordToDictionary(record))

          results.forEach((msg) => {
            if (!msg.level || msg.level === 'error') {
              record.addError(msg.key, msg.message)
            }
            if (msg.level === 'warning') {
              record.addWarning(msg.key, msg.message)
            }
            if (msg.level === 'info') {
              record.addInfo(msg.key, msg.message)
            }
          })
        })
      })
    )
  }
}
