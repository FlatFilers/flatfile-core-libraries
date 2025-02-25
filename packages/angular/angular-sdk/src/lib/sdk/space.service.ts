import { Injectable, signal, computed } from '@angular/core'
import {
  type ISpace,
  type ReusedSpaceWithAccessToken,
  type SimpleOnboarding,
  createWorkbookFromSheet,
  initNewSpace,
  InitialResourceData,
} from '@flatfile/embedded-utils'
import getSpace, { GetSpaceReturn } from '../../utils/getSpace'
import { Flatfile } from '@flatfile/api'

type ReusedOrOnboarding = ReusedSpaceWithAccessToken | SimpleOnboarding

const DEFAULT_API_URL = 'https://platform.flatfile.com/api'

@Injectable({
  providedIn: 'root',
})
export class SpaceService {
  private readonly _loading = signal(false)
  readonly loading = computed(() => this._loading())

  private readonly _spaceInitialized = signal<object | undefined>(undefined)
  readonly spaceInitialized = computed(() => this._spaceInitialized())

  private currentSpaceProps?: ISpace
  localSpaceData: Record<string, any> | undefined

  spaceResponse?: Partial<InitialResourceData> & { space: Flatfile.Space }

  config?: {
    resetOnClose: boolean
  }

  private async getOrCreateSpace(
    spaceProps: ReusedOrOnboarding
  ): Promise<InitialResourceData | GetSpaceReturn> {
    const { publishableKey } = spaceProps
    if (!publishableKey) {
      return getSpace(spaceProps)
    }

    const {
      name,
      namespace,
      languageOverride,
      translationsPath,
      workbook,
      document,
      themeConfig,
      sidebarConfig,
      userInfo,
      apiUrl,
      sheet,
      onSubmit,
    } = spaceProps

    let createdWorkbook = workbook
    const isAutoConfig = !createdWorkbook && !sheet

    if (!createdWorkbook && sheet) {
      createdWorkbook = createWorkbookFromSheet(sheet, !!onSubmit)
    }

    return initNewSpace({
      name,
      namespace,
      languageOverride,
      translationsPath,
      publishableKey,
      workbook: createdWorkbook,
      document,
      themeConfig,
      sidebarConfig,
      userInfo,
      isAutoConfig,
      apiUrl: apiUrl || DEFAULT_API_URL,
    })
  }

  async initSpace(spaceProps: ISpace): Promise<any> {
    if (!spaceProps) {
      console.warn('spaceProps is required')
      return
    }

    if (this.spaceInitialized() && !this.config?.resetOnClose) {
      console.warn('Space is already initialized')
      return
    }
    this._loading.set(true)

    spaceProps.apiUrl ||= DEFAULT_API_URL
    ;(window as any).CROSSENV_FLATFILE_API_URL = spaceProps.apiUrl

    this.currentSpaceProps = spaceProps

    try {
      this.spaceResponse = await this.getOrCreateSpace(spaceProps)
      const { space } = this.spaceResponse

      if (!space) {
        throw new Error('Missing space from response')
      }

      const { id: spaceId, accessToken, guestLink } = space

      if (!spaceId || typeof spaceId !== 'string') {
        throw new Error('Missing spaceId from space response')
      }

      if (!guestLink || typeof guestLink !== 'string') {
        throw new Error('Missing guest link from space response')
      }

      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Missing access token from space response')
      }

      const formattedSpaceProps = {
        ...spaceProps,
        spaceUrl: guestLink,
        localAccessToken: accessToken,
        apiUrl: spaceProps.apiUrl,
        workbook: spaceProps.workbook || this.spaceResponse.workbooks?.[0],
      }
      this._spaceInitialized.set(formattedSpaceProps)
      this._loading.set(false)
      return formattedSpaceProps
    } catch (error) {
      console.error('Failed to initialize space:', error)
      throw error
    }
  }

  OpenEmbed = this.startFlatfile
  async startFlatfile(spaceProps: ISpace): Promise<void> {
    this.currentSpaceProps = spaceProps
    return this.initSpace(this.currentSpaceProps)
  }

  closeEmbed(): void {
    this._loading.set(false)
    this._spaceInitialized.set(undefined)
  }
}
