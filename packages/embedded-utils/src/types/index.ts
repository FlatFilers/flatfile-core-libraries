import type {
  ISpace,
  ISpaceInfo,
  IUserInfo,
  NewSpaceFromPublishableKey,
  ReusedSpaceWithAccessToken,
  SimpleOnboarding,
} from './Space'
import type { InitState, State } from './State'

import type { ISidebarConfig } from './ISidebarConfig'
import type { IThemeConfig } from './IThemeConfig'
import type { SpaceComponent } from './SpaceComponent'
import type { IThemeGenerator } from './ThemeGenerator'

export type {
  ISidebarConfig,
  ISpace,
  ISpaceInfo,
  IThemeConfig,
  IThemeGenerator,
  IUserInfo,
  InitState,
  NewSpaceFromPublishableKey,
  ReusedSpaceWithAccessToken,
  SimpleOnboarding,
  SpaceComponent,
  State,
}

export { DefaultSubmitSettings } from './Space'
export * from './IDefaultPageType'
