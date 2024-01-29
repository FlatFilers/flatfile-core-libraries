import { Flatfile } from '@flatfile/api'

export const createWorkbookFromSheet = (
  sheet: Flatfile.SheetConfig,
  onSubmit?: boolean
): Pick<Flatfile.CreateWorkbookConfig, 'name' | 'sheets' | 'actions'> => {
  const returnSheetWithSlug = (
    sheet: Flatfile.SheetConfig
  ): Flatfile.SheetConfig => {
    if (!sheet.slug) {
      return { ...sheet, slug: sheet.name }
    }
    return sheet
  }
  const blueprint = {
    name: sheet?.name || 'Embedded Importer',
    sheets: [returnSheetWithSlug(sheet)],
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
