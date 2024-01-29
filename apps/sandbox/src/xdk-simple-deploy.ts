import {
  Sheet,
  Workbook,
  TextField,
  Message,
  SpaceConfig,
  ReferenceField,
  Action,
} from '@flatfile/configure'

const axios = require('axios')
const FormData = require('form-data')

async function generateJSON(event: any, sheetName: string, data: any) {
  const formData = new FormData()
  formData.append('spaceId', event.context.spaceId)

  formData.append('environmentId', event.context.environmentId)
  formData.append('file', JSON.stringify(data), {
    filename: `Sheet ${sheetName}.json`,
  })

  try {
    await axios.post(`v1/files`, formData, {
      headers: formData.getHeaders(),
      transformRequest: () => formData,
    })
  } catch (error) {
    console.log(`upload error: ${JSON.stringify(error, null, 2)}`)
  }
}

const GenerateJSONAction = new Action(
  {
    slug: 'generateJSON',
    label: 'Generate JSON',
    description: 'Generate a JSON file based off of the Data in this Sheet',
  },
  async (e) => {
    const sheetName = e.context.actionName.split(':')[0]
    try {
      const data = (await e.data).records
      await generateJSON(e, sheetName, data)
    } catch (error) {
      console.log(
        `GenerateJSONAction[error]: ${JSON.stringify(error, null, 2)}`
      )
    }
  }
)

const TestSheet = new Sheet(
  'TestSheet',
  {
    firstName: TextField({
      label: 'First Name',
      description: "This is a human's first name",
    }),
    middleName: TextField({
      label: 'Middle Name',
      readonly: true,
      blueprint: { metadata: { do: 'thing' } },
    }),
    lastName: TextField({
      label: 'Last Name',
      compute: (val: string): string => {
        if (val == 'bar') {
          return 'baz'
        }
        return val
      },
      validate: (val: string): void | Message[] => {
        if (val === 'Rock') {
          throw 'Rock is not allowed!!!'
        }
      },
    }),
  },
  {
    recordCompute: (record) => {
      const firstName = String(record.get('firstName'))
      if (firstName) {
        if (firstName && firstName.includes(' ')) {
          const components = firstName.split(' ')
          if (components.length > 1 && components[1] !== '') {
            record.set('firstName', components[0])
            record.set('lastName', components[1])

            record
              .addInfo('firstName', 'Full name was split')
              .addInfo('lastName', 'Full name was split')
          }
        }
      }
    },
    actions: {
      GenerateJSONAction,
    },
    access: ['add', 'edit'],
  }
)

const SheetWithLink = new Sheet(
  'SheetWithLink',
  {
    nickname: TextField(),
    lastName: ReferenceField({
      label: 'Last Name',
      sheetKey: 'TestSheet',
      foreignKey: 'lastName',
      relationship: 'has-many',
    }),
  },
  {
    recordCompute: (record) => {
      const links = record.getLinks('lastName')
      const middleName = links[0].middleName
      if (middleName) {
        record.set('nickname', middleName)
      }
      record.set('lastName', 'Joey')
    },
    readonly: true,
  }
)

const Workbook1 = new Workbook({
  name: 'Workbook 1',
  slug: 'workbook-test',
  namespace: 'workbook-1',
  sheets: {
    TestSheet,
    SheetWithLink,
  },
})

const SpaceConfig1 = new SpaceConfig({
  name: 'Readonly Field Test 2',
  slug: 'readonly-2',
  workbookConfigs: {
    Workbook1,
  },
})

export default SpaceConfig1
