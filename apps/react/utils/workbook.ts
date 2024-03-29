import { Flatfile } from '@flatfile/api'
import { sheet } from '@/utils/sheet'
const sheet2 = { ...sheet, name: 'Contacts 2', slug: 'contacts2' }
export const workbook: Flatfile.CreateWorkbookConfig = {
  name: 'Contacts',
  sheets: [sheet, sheet2],
  actions: [
    {
      operation: 'submitActionFg',
      mode: 'background',
      label: 'Submit background',
      description: 'Submit data to webhook.site',
    },
  ],
}
