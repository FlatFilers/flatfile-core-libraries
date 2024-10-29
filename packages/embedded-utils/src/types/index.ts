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
import type { InitialResourceData } from './InitialResourceData'
import type { SpaceComponent } from './SpaceComponent'
import type { IThemeGenerator } from './ThemeGenerator'
import type { InitSpaceType } from './initSpace'

export type {
  InitialResourceData,
  InitSpaceType,
  InitState,
  ISidebarConfig,
  ISpace,
  ISpaceInfo,
  IThemeConfig,
  IThemeGenerator,
  IUserInfo,
  NewSpaceFromPublishableKey,
  ReusedSpaceWithAccessToken,
  SimpleOnboarding,
  SpaceComponent,
  State
}

export * from './IDefaultPageType'
export { DefaultSubmitSettings } from './Space'
