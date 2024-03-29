import { Flatfile } from '@flatfile/api'

export const createWorkbookFromSheets = (
  sheets: Flatfile.SheetConfig[],
  onSubmit?: boolean,
  workbookName?: string
): Flatfile.CreateWorkbookConfig => {
  const returnSheetWithSlug = (
    sheet: Flatfile.SheetConfig
  ): Flatfile.SheetConfig => {
    if (!sheet.slug) {
      return { ...sheet, slug: sheet.name }
    }
    return sheet
  }
  const name =
    workbookName || (sheets.length === 1 ? sheets[0].name : 'Embedded Importer')
  const blueprint = {
    name,
    sheets: sheets.map((sheet) => returnSheetWithSlug(sheet)),
  }
  return onSubmit
    ? {
        ...blueprint,
        actions: [
          {
            operation: 'simpleSubmitAction',
            mode: 'foreground',
            label: 'Submit data',
            description: 'Action for handling data inside of onSubmit',
            primary: true,
          },
        ],
      }
    : { ...blueprint, actions: [] }
}
