import type {
  ISidebarConfig,
  ISpace,
  ISpaceInfo,
  IThemeConfig,
  IUserInfo,
} from '@flatfile/embedded-utils'

import stylesheet from './components/style.scss'
import { styleInject } from './utils/styleInject'
export { makeTheme } from './utils/makeTheme'

export * from './components'
export * from './hooks'
export type { ISidebarConfig, ISpace, ISpaceInfo, IThemeConfig, IUserInfo }

export function attachStyleSheet(options?: {
  insertAt?: 'top'
  nonce?: string
}) {
  styleInject(stylesheet, options)
}
