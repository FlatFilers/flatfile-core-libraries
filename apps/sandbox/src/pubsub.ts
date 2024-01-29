import {
  Client,
  FlatfileVirtualMachine,
  FlatfileEvent,
} from '@flatfile/listener'
import { createBlueprintFromConfigure } from '@flatfile/configure'
import { FlatfileRecord } from '@flatfile/hooks'
import { recordHook } from '@flatfile/plugin-record-hook'
import xdk from './xdk-simple-deploy'
import api, { Flatfile } from '@flatfile/api'
import { RecordsWithLinks } from '@flatfile/api/api'

const example = Client.create((client) => {
  /**
   * This is a basic hook on events with no sugar on top
   */

  client.use(
    recordHook('TestSheet', (record: FlatfileRecord) => {
      const firstName = record.get('firstName')
      // Getting the real types here would be nice but seems tricky
      record.set('middleName', 'TestSheet ' + firstName)
      return record
    })
  )

  client.on(
    'records:*',
    { target: 'sheet(TestSheet)' },
    async (event: FlatfileEvent) => {
      const records: RecordsWithLinks = await event.data
      records.map((record) => {
        record.values.firstName.value = 'Alex '
      })
      await event.update(records)
    }
  )

  /**
   * This is a setup of the space with its workbooks
   */
  client.on('client:init', async (event) => {
    // Set "deployNewSpace": "true" in .flatfilerc's "internal" param to create a Space Config and Space here
    const { deployNewSpace } = process.env
    // console.log('client:init')
    // Will build the space config and create the space
    if (deployNewSpace === 'true') {
      try {
        const blueprint = createBlueprintFromConfigure(xdk.mount())
        if (!blueprint) return

        const environmentId = event.context.environmentId

        // Create Space
        const space = await api.spaces.create({
          name: 'Test Space 2',
          environmentId,
        })

        if (!space.data) return

        // Create Workbook
        const workbook = await api.workbooks.create({
          name: 'Test Workbook',
          spaceId: space.data.id,
          environmentId,
          sheets: blueprint.blueprints[0].sheets as Flatfile.SheetConfig[],
        })

        if (!workbook.data) return

        // Update Space with Workbook
        await api.spaces.update(space.data.id, {
          primaryWorkbookId: workbook.data.id,
          environmentId,
        })
      } catch (e) {
        console.log(`error creating Space or Workbook: ${e}`)
      }
    }
  })
})

const FlatfileVM = new FlatfileVirtualMachine()

example.mount(FlatfileVM)

export default example
