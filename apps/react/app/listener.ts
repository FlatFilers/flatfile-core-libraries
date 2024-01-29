import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'

/**
 * Example Listener
 */
export const listener = FlatfileListener.create((client) => {
  client.use(
    recordHook('TestSheet', (record) => {
      const firstName = record.get('first_name')
      console.log({ firstName })
      // Gettign the real types here would be nice but seems tricky
      record.set('last_name', 'Rock')
      return record
    })
  )
})
