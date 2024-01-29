import { Client, FlatfileEvent } from '@flatfile/listener'

import fetch from 'node-fetch'

export default (client: Client) => {
  /**
   * This is a basic hook on events with no sugar on top
   */
  client.on('**', (event: FlatfileEvent) => {
    console.log(event)
  })

  client.on(
    'commit:created',
    {
      context: {
        // @ts-ignore
        sheetSlug: 'TestSheet',
      },
    },
    async (event: FlatfileEvent) => {
      try {
        const { records } = await event.data

        const recordsUpdates = records.map((record) => {
          record.values.middleName.value = 'TEST'
          return record
        })

        await event.update(recordsUpdates)
      } catch (e) {
        console.log(`Error getting records: ${e}`)
      }
    }
  )

  client.on('action:triggered', async (event) => {
    const webhookReceiver =
      'https://webhook.site/047490ec-4da0-44d1-85f6-dfab0095c72f'
    // copy your https://webhook.site URL for testing
    const res = await fetch(webhookReceiver, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event.payload),
    })
  })
}
