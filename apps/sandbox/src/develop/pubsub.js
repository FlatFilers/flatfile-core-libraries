export default (client) => {
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
    async (event) => {
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
}
