import api, { Flatfile } from '@flatfile/api'

export const getSheetConfigFromSession = async (
  sheetSessionKey: string,
  sheetId: string,
): Promise<Flatfile.SheetConfig> => {
  try {
    const sheetConfig = sessionStorage.getItem(sheetSessionKey)
    if (sheetConfig) {
      return sheetConfig
    } else {
      const {
        data: { config },
      } = await api.sheets.get(sheetId)
      sessionStorage.setItem(sheetSessionKey, config)
      return config
    }
  } catch (e) {
    const {
      data: { config },
    } = await api.sheets.get(sheetId)
    return config
  }
}
