import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import * as CSS from 'csstype'
import { ISidebarConfig } from './ISidebarConfig'
import { IThemeConfig } from './IThemeConfig'
import {
  TPrimitive,
  TRecordDataWithLinks,
  FlatfileRecord,
} from '@flatfile/hooks'

export type ISpace = NewSpaceFromPublishableKey | ReusedSpaceWithAccessToken

export interface NewSpaceFromPublishableKey extends BaseSpace {
  /**
   * Name of space
   * Optional
   */
  name?: string
  /**
   * Theme values for space, sidebar and data table
   * Optional
   */
  themeConfig?: IThemeConfig
  /**
   * Sidebar config values to toggle UI elements
   * Optional
   */
  sidebarConfig?: ISidebarConfig
  /**
   * Document to pass to space
   * Optional
   */
  document?: Flatfile.DocumentConfig & { defaultPage?: boolean }
  /**
   * @deprecated use params up one level instead
   *
   * Additional props when creating a Space
   * Optional
   */
  spaceBody?: {
    [key: string]: any
    themeConfig?: never
    sidebarConfig?: never
    userInfo?: never
    spaceInfo?: never
  }
  /**
   * @deprecated should use userInfo instead.
   *
   * Additional metadata to be passed to the space
   * Optional
   */
  spaceInfo?: Partial<ISpaceInfo>
  /**
   * Additional metadata to be passed to the space
   * Optional
   */
  userInfo?: Partial<IUserInfo>
  /**
   * Shape of data you will be receiving:
   * Required
   */
  workbook?: Omit<Flatfile.CreateWorkbookConfig, 'sheets'> & {
    sheets?: (Flatfile.SheetConfig & { defaultPage?: boolean })[]
    defaultPage?: boolean
  }
  /**
   * Publishable key accessed via auth/api-keys or Flatfile dashboard > Developer
   * Required
   */
  publishableKey: string
  space?: never
}

export interface ReusedSpaceWithAccessToken extends BaseSpace {
  /**
   * Publishable key accessed via auth/api-keys or Flatfile dashboard > Developer
   * Required
   */

  space: {
    id: string
    accessToken: string
  }
  publishableKey?: never
  name?: never
  themeConfig?: never
  sidebarConfig?: never
  document?: never
  spaceInfo?: never
  userInfo?: never
  workbook?: never
  /**
   * @deprecated use params up one level instead
   *
   * Additional props when creating a Space
   * Optional
   */
  spaceBody?: never
}

type SubmitSettings = {
  deleteSpaceAfterSubmit?: boolean
}
export const DefaultSubmitSettings = {
  deleteSpaceAfterSubmit: false,
} satisfies SubmitSettings

export interface SimpleOnboarding extends NewSpaceFromPublishableKey {
  publishableKey: string
  sheet?: Flatfile.SheetConfig
  onSubmit?: ({
    data,
    sheet,
    job,
    event,
  }: {
    data?: any
    sheet?: any
    job?: any
    event?: FlatfileEvent
  }) => Promise<void> | void
  onRecordHook?: (
    record: FlatfileRecord<TRecordDataWithLinks<TPrimitive>>,
    event?: FlatfileEvent
  ) => FlatfileRecord
  onCancel?: () => void
  submitSettings?: SubmitSettings
}

interface BaseSpace {
  /**
   * Identifier for environment
   * Required
   */
  environmentId?: string
  /**
   * Listener for advanced functionality
   * Optional
   */
  listener?: FlatfileListener
  /**
   *
   * Style the iframe using CSS Properties
   * Optional
   */
  iframeStyles?: CSS.Properties<string | number>
  /**
   *
   * Mount the iframe to a specific element
   * Optional
   */
  mountElement?: string
  /**
   * Operation to perform when the space is closed
   * Optional
   */
  closeSpace?: {
    operation?: string
    onClose?: (data: any) => void
  }
  /**
   *
   * Custom prompt to display when user tries to exit the space
   * Optional
   */
  exitText?: string
  /**
   *
   * Custom header to display when user tries to exit the space
   * Optional
   */
  exitTitle?: string
  /**
   * Custom text to update the primary button to exit
   * Optional
   */
  exitPrimaryButtonText?: string
  /**
   * Custom text to update the secondary button to exit
   * Optional
   */
  exitSecondaryButtonText?: string
  /**
   *
   * Url to override default flatfile api url
   * Optional
   */
  apiUrl?: string
  /**
   * @deprecated use errorTitle instead
   * Error element to override default Error component
   * Optional
   */
  error?: (error: Error | string) => any
  /**
   * Loading element to override default Loading component
   * Optional
   */

  loading?: any
  /**
   *
   * Displays inline if false
   * Optional
   */
  displayAsModal?: boolean
  /**
   *
   * Url to override default flatfile space url
   * Optional
   */
  spaceUrl?: string
  /**
   * @deprecated use spacesUrl instead
   */
  baseUrl?: string
  /**
   * Error text override the feedback error
   * Optional
   */
  errorTitle?: string
  metadata?: any
  namespace?: string
  labels?: string[]
  translationsPath?: string
  languageOverride?: string
}

export interface IUserInfo {
  userId?: string
  name?: string
  companyId?: string
  companyName?: string
}

export interface ISpaceInfo {
  userId?: string
  name?: string
  companyId?: string
  companyName?: string
}
