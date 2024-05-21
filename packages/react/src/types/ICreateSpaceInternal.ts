import { Flatfile } from '@flatfile/api'
export type CREATE_SPACE_INTERNAL = {
  apiUrl: string
  publishableKey: string
  space: Flatfile.SpaceConfig
  workbook?: Flatfile.CreateWorkbookConfig
  document?: Flatfile.DocumentConfig
}
