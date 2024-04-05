import { Flatfile } from '@flatfile/api'

export const workbookOnSubmitAction: Flatfile.Action = {
  operation: 'simpleSubmitAction',
  mode: 'foreground',
  label: 'Submit data',
  description: 'Action for handling data inside of onSubmit',
  primary: true,
}
