import { RecordWithLinks } from '@flatfile/api'
import {
  Sheet,
  Workbook,
  TextField,
  SpaceConfig,
  Action,
} from '@flatfile/configure'

// Displays all records' metadata in a regular field to make it visible to the user
const DisplayMetadata = new Action(
  {
    slug: 'displayMetadata',
    label: 'Display metadata',
    description: 'Write each record\'s metadata to the "metadataString" field',
  },
  async (event) => {
    const { sheetId } = event.context
    const recordsResponse = await event.api.getRecords({
      sheetId,
    })

    if (!recordsResponse?.data?.records) {
      return
    }

    // Copy metadata to the "metadataString" field
    const recordsUpdates = recordsResponse.data.records.map(
      (record: RecordWithLinks) => {
        record.values.metadataString.value = JSON.stringify(record.metadata)
        return record
      }
    )

    await event.api.updateRecords({
      sheetId,
      recordsUpdates,
    })
  }
)

const TestSheet = new Sheet(
  'TestSheet',
  {
    firstName: TextField({
      label: 'First Name',
      description: "This is a human's first name",
    }),
    lastName: TextField({
      label: 'Last Name',
      readonly: true,
    }),
    metadataString: TextField(),
  },
  {
    recordCompute: (record) => {
      const firstName = String(record.get('firstName'))
      // Set the field's metadata
      record.setMetadata({
        firstNameLength: firstName.length,
      })
    },
    actions: {
      DisplayMetadata,
    },
    access: ['add', 'edit', 'delete', 'import'],
  }
)

const Workbook1 = new Workbook({
  name: 'Workbook 1',
  slug: 'workbook-test',
  namespace: 'workbook-1',
  sheets: {
    TestSheet,
  },
})

const SpaceConfig1 = new SpaceConfig({
  name: 'Config with metadata',
  slug: 'config-metadata',
  workbookConfigs: {
    Workbook1,
  },
})

export default SpaceConfig1
