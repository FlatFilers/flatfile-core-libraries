import { Flatfile } from '@flatfile/api';

export const useWorkbook = (): Pick<
  Flatfile.CreateWorkbookConfig,
  'name' | 'labels' | 'sheets' | 'actions'
> => {

  return {
    name: 'All Data',
    labels: ['pinned'],
    sheets: [
      {
        name: 'Test',
        slug: 'test',
        fields: [
          {
            key: 'code',
            type: 'string',
            label: 'Code',
          },
          {
            key: 'type',
            type: 'enum',
            label: 'Quote Type',

            config: {
              options: [
                {
                  value: 'cost',
                  label: 'Cost',
                },
                {
                  value: 'revenue',
                  label: 'Revenue',
                }
              ]
            },
          },
        ]
      },
    ],
    actions: [
      {
        operation: 'submitActionFg',
        mode: 'foreground',
        label: 'Submit foreground',
        description: 'Submit jobId, envId, workbookId to data upload services',
        primary: true,
        constraints: [{ type: 'hasAllValid' }, { type: 'hasData' }],
      },
    ],
  };
};
