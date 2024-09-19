import { Flatfile } from '@flatfile/api'

export const sheet: Flatfile.SheetConfig = {
  name: 'Contacts',
  slug: 'contacts',
  fields: [
    {
      key: 'firstName',
      type: 'string',
      label: 'First Name',
      config: undefined,
    } as Flatfile.Property.String,
    {
      key: 'lastName',
      type: 'string',
      label: 'Last Name',
      config: undefined,
    } as Flatfile.Property.String,
    {
      key: 'email',
      type: 'string',
      label: 'Email',
      config: undefined,
    } as Flatfile.Property.String,
    {
      key: 'status',
      type: 'enum',
      label: 'Status',
      config: {
        allowCustom: true,
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
  allowAdditionalFields: true,
  actions: [
    {
      operation: 'submitActionFg',
      mode: 'background',
      label: 'Submit foreground',
      description: 'Submit data to webhook.site',
      primary: true,
    },
  ],
}
