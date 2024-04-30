import {
  DefaultSubmitSettings,
  ISpace,
  ISpaceInfo,
  IUserInfo,
  NewSpaceFromPublishableKey,
  ReusedSpaceWithAccessToken,
  SimpleOnboarding,
} from './Space'
import { InitState, State } from './State'

import { ISidebarConfig } from './ISidebarConfig'
import { IThemeConfig } from './IThemeConfig'
import { SpaceComponent } from './SpaceComponent'
import { IThemeGenerator } from './ThemeGenerator'

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

export { DefaultSubmitSettings }
