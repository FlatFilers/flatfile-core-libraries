import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'

/**
 * Example Listener
 */
export const listener = FlatfileListener.create((client) => {
  client.use(
    recordHook('contacts', (record) => {
      const firstName = record.get('first_name')
      console.log({ firstName })
      // Gettign the real types here would be nice but seems tricky
      record.set('email', 'Rock')
      return record
    })
  )
})

export const plainListener = (client: FlatfileListener) => {
  client.use(
    recordHook('contacts', (record) => {
      const firstName = record.get('firstName')
      console.log({ firstName })
      // Gettign the real types here would be nice but seems tricky
      record.addError('email', 'Rock is an astronaut?')
      return record
    })
  )
}
