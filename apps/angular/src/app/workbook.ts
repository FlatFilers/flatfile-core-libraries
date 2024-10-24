import { Flatfile } from '@flatfile/api'
import { sheet } from './sheet'

export const workbook: Flatfile.CreateWorkbookConfig = {
  name: 'All Data',
  labels: ['pinned'],
  sheets: [sheet],
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
