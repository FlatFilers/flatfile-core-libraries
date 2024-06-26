export const workbook = {
  name: 'All Data',
  labels: ['pinned'],
  sheets: [
    {
      name: 'Contacts',
      slug: 'contacts',
      allowAdditionalFields: true,
      fields: [
        {
          key: 'firstName',
          type: 'string',
          label: 'First Name',
        },
        {
          key: 'lastName',
          type: 'string',
          label: 'Last Name',
        },
        {
          key: 'email',
          type: 'string',
          label: 'Email',
        },
      ],
    },
    {
      name: 'Contacts 2',
      slug: 'contacts2',
      allowAdditionalFields: true,
      // defaultPage: true,
      fields: [
        {
          key: 'firstName',
          type: 'string',
          label: 'First Name',
        },
        {
          key: 'lastName',
          type: 'string',
          label: 'Last Name',
        },
        {
          key: 'email',
          type: 'string',
          label: 'Email',
        },
      ],
    },
  ],
  actions: [
    {
      operation: 'submitActionFg',
      mode: 'foreground',
      label: 'Submit foreground',
      description: 'Submit data to webhook.site',
      primary: true,
    },
  ],
}
