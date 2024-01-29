import InitSpace from './src/components/InitSpace'
import Space from './src/components/Space'

import type {
  ISidebarConfig,
  ISpace,
  ISpaceInfo,
  IThemeConfig,
  IUserInfo,
} from '@flatfile/embedded-utils'
import { usePortal } from './src/hooks/usePortal'
import { useSpace } from './src/hooks/useSpace'
import { initializeFlatfile } from './src/hooks/useSpaceTrigger'
import { makeTheme } from './src/utils/makeTheme'

export { InitSpace, Space, initializeFlatfile, makeTheme, usePortal, useSpace }

export type { ISidebarConfig, ISpace, ISpaceInfo, IThemeConfig, IUserInfo }
