import { Sheet, TextField, Workbook } from '@flatfile/configure'

export const MyWorkbook = new Workbook({
  name: 'My Workbook',
  namespace: 'test',
  sheets: {
    TestSheet: new Sheet(
      'TestSheet',
      {
        firstName: TextField('Full Name'),
        middleName: TextField('Middle Name'),
        lastName: TextField({
          name: 'Last Name',
          compute: (val) => {
            return val.toLowerCase()
          },
        }),
      },
      {
        // recordCompute: (record) => console.log({ record }),
      }
    ),
  },
})
