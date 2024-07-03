import { Flatfile } from '@flatfile/api'

// TODO: Replace hardcoded type with imported type from Platform
export interface InitialResourceData {
  workbooks: Flatfile.Workbook[] | null
  documents: Flatfile.Document[] | null
  space: Flatfile.Space
  actor: Flatfile.User | Flatfile.Guest | undefined
  entitlements: any[]
  environment: Partial<Flatfile.Environment> & {
    hasAccess: boolean
  }
}
