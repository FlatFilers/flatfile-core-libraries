import InitSpace from './components/InitSpace'
import Space from './components/Space'

import type {
  ISidebarConfig,
  ISpace,
  ISpaceInfo,
  IThemeConfig,
  IUserInfo,
} from '@flatfile/embedded-utils'
import { usePortal } from './hooks/usePortal'
import { useSpace } from './hooks/useSpace'
import { initializeFlatfile } from './hooks/useSpaceTrigger'
import { makeTheme } from './utils/makeTheme'

export { InitSpace, Space, initializeFlatfile, makeTheme, usePortal, useSpace }

export type { ISidebarConfig, ISpace, ISpaceInfo, IThemeConfig, IUserInfo }
