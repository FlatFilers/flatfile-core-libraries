import { Flatfile } from '@flatfile/api'

export const workbookOnSubmitAction = (sheetSlug?: string): Flatfile.Action => {
  const operation = sheetSlug
    ? `sheetSubmitAction-${sheetSlug}`
    : 'workbookSubmitAction'
  return {
    operation,
    mode: 'foreground',
    label: 'Submit',
    description: 'Action for handling data inside of onSubmit',
    primary: true,
  }
}
