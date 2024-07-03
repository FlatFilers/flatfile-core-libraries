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

/**
 * @description Inserts a CSS stylesheet into the page using the `styleInject` method,
 * passing in the stylesheet and any optional parameters for insertion position and
 * nonce.
 * 
 * @param {object} options - settings for inserting the stylesheet at a particular
 * location on the page and includes an optional nonce value used to verify the
 * integrity of the stylesheet contents.
 */
export function attachStyleSheet(options?: {
  insertAt?: 'top'
  nonce?: string
}) {
  styleInject(stylesheet, options)
}
