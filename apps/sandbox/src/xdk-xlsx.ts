import {
  Sheet,
  Workbook,
  TextField,
  Message,
  SpaceConfig,
} from '@flatfile/configure'

import { EventTopic } from '@flatfile/api'

import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'

const TestSheet = new Sheet(
  'TestSheet',
  {
    firstName: TextField({
      label: 'First Name',
      description: "This is a human's first name",
    }),
    middleName: TextField('Middle'),
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
  }
)

const Workbook1 = new Workbook({
  name: 'Workbook 1',
  slug: 'xdk-test',
  namespace: 'xdk-test',
  sheets: {
    TestSheet,
  },
})

const SpaceConfig1 = new SpaceConfig({
  name: 'xlsx Config 3',
  slug: 'xlsx-test-3',
  workbookConfigs: {
    Workbook1,
  },
})

SpaceConfig1.on([EventTopic.Uploadcompleted], (event) => {
  return new ExcelExtractor(event, { rawNumbers: true }).runExtraction()
})

export default SpaceConfig1
