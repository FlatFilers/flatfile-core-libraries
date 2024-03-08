import type { Flatfile } from '@flatfile/api'

import {
  ISidebarConfig,
  IThemeConfig,
  IUserInfo,
} from '@flatfile/embedded-utils'

export interface UpdateSpaceInfo {
  apiUrl: string
  publishableKey?: string
  workbook?: Flatfile.CreateWorkbookConfig
  spaceId: string
  environmentId?: string
  mountElement: string
  errorTitle: string
  themeConfig?: IThemeConfig
  document?: Flatfile.DocumentConfig
  sidebarConfig?: ISidebarConfig
  userInfo?: Partial<IUserInfo>
  spaceInfo?: Partial<IUserInfo>
  accessToken: string
  spaceBody?: any
}
