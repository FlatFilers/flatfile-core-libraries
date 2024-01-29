import {
  Client,
  FlatfileVirtualMachine,
  FlatfileEvent,
} from '@flatfile/listener'
import { RecordHook } from '@flatfile/configure'
import { FlatfileRecord } from '@flatfile/hooks'

export default (client: Client) => {
  /**
   * This is a basic hook on events with no sugar on top
   */

  client.on(
    'commit:created',
    {
      context: {
        // @ts-ignore
        sheetSlug: 'TestSheet',
      },
    },
    async (event: FlatfileEvent) => {
      RecordHook(event, async (record: FlatfileRecord) => {
        const firstName = record.get('firstName')
        // Gettign the real types here would be nice but seems tricky
        record.set('middleName', 'Alex Rock ' + firstName)
        return record
      })
    }
  )
}
