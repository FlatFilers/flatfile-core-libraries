import { Flatfile } from '@flatfile/api'

export const config: Pick<
  Flatfile.CreateWorkbookConfig,
  'name' | 'sheets' | 'actions'
> = {
  name: 'Employees workbook',
  sheets: [
    {
      name: 'TestSheet',
      slug: 'TestSheet',
      fields: [
        {
          key: 'first_name',
          type: 'string',
          label: 'First name',
          constraints: [
            {
              type: 'required',
            },
          ],
        },
        {
          key: 'last_name',
          type: 'string',
          label: 'last name',
        },
        {
          key: 'full_name',
          type: 'string',
          label: 'full name',
        },
        {
          key: 'status',
          type: 'enum',
          label: 'Status',
          config: {
            options: [
              {
                value: 'blocked',
                label: 'Blocked',
              },
              {
                value: 'in-progress',
                label: 'In Progress',
              },
              {
                value: 'completed',
                label: 'Completed',
              },
            ],
          },
        },
      ],
      actions: [
        {
          label: 'Join fields',
          operation: 'contacts:join-fields',
          description: 'Would you like to join fields?',
          mode: 'foreground',
          confirm: true,
          constraints: [{ type: 'hasData' }],
        },
      ],
    },
  ],
  actions: [
    {
      label: 'Submit',
      operation: 'contacts:submit',
      description: 'Would you like to submit your workbook?',
      mode: 'foreground',
      primary: true,
      confirm: true,
    },
  ],
}
