import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, filter, firstValueFrom } from 'rxjs'
import {
  type ISpace,
  type ReusedSpaceWithAccessToken,
  type SimpleOnboarding,
  createWorkbookFromSheet,
  initNewSpace,
  InitialResourceData,
} from '@flatfile/embedded-utils'
import c from 'ansi-colors'
import getSpace from '../../utils/getSpace'
import { Flatfile } from '@flatfile/api'

type ReusedOrOnboarding = ReusedSpaceWithAccessToken | SimpleOnboarding

type SpaceProps = any
@Injectable({
  providedIn: 'root',
})
export class SpaceService {
  private loadingSubject = new BehaviorSubject<boolean>(false)
  loading$: Observable<boolean> = this.loadingSubject.asObservable()

  private currentSpaceProps?: SpaceProps
  private spaceInitializedSubject = new BehaviorSubject<object | undefined>(
    undefined
  )
  spaceInitialized$: Observable<object | undefined> =
    this.spaceInitializedSubject.asObservable()
  get spaceInitialized(): object | undefined {
    return this.spaceInitializedSubject.value
  }
  set spaceInitialized(value: object | undefined) {
    this.spaceInitializedSubject.next(value)
  }
  spaceResponse: any
  localSpaceData: Record<string, any> | undefined

  constructor() {}

  getOrCreateSpace = async (
    spaceProps: ReusedOrOnboarding
  ): Promise<Partial<InitialResourceData> & { space: Flatfile.Space }> => {
    const {
      publishableKey,
      workbook,
      document,
      themeConfig,
      sidebarConfig,
      userInfo,
      apiUrl,
    } = spaceProps
    if (!publishableKey) {
      return await getSpace(spaceProps)
    } else {
      let createdWorkbook = workbook
      let isAutoConfig = false

      if (!createdWorkbook) {
        if (!spaceProps.sheet) {
          isAutoConfig = true
        } else {
          createdWorkbook = createWorkbookFromSheet(
            spaceProps.sheet,
            !!spaceProps.onSubmit
          )
        }
      }

      return await initNewSpace({
        publishableKey,
        workbook: createdWorkbook,
        document,
        themeConfig,
        sidebarConfig,
        userInfo,
        isAutoConfig,
        apiUrl: apiUrl || 'https://platform.flatfile.com/api',
      })
    }
  }

  async initSpace(spaceProps: SpaceProps): Promise<any> {
    if (!spaceProps) {
      console.warn('spaceProps is required')
      return
    }
    if (this.spaceInitialized) {
      console.warn('Space is already initialized')
      return
    }

    if (!spaceProps.apiUrl) {
      spaceProps.apiUrl = 'https://platform.flatfile.com/api'
    }
    ;(window as any).CROSSENV_FLATFILE_API_URL = spaceProps.apiUrl

    this.currentSpaceProps = spaceProps
    try {
      this.spaceResponse = await this.getOrCreateSpace(spaceProps)
      const { id: spaceId, accessToken, guestLink } = this.spaceResponse.space

      if (!spaceId || typeof spaceId !== 'string') {
        throw new Error('Missing spaceId from space response')
      }

      if (!guestLink || typeof guestLink !== 'string') {
        throw new Error('Missing guest link from space response')
      }

      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Missing access token from space response')
      }

      this.localSpaceData = {
        spaceId,
        spaceUrl: guestLink,
        localAccessToken: accessToken,
      }

      const formattedSpaceProps = {
        ...spaceProps,
        ...this.localSpaceData,
        apiUrl:
          this.spaceResponse.apiUrl || 'https://platform.flatfile.com/api',
        workbook:
          this.spaceResponse.workbook || this.spaceResponse.workbooks?.[0],
      }

      this.spaceInitializedSubject.next(formattedSpaceProps)
      return formattedSpaceProps
    } catch (error) {
      console.error('Failed to initialize space:', error)
      throw error
    }
  }

  OpenEmbed = this.startFlatfile
  async startFlatfile(spaceProps: SpaceProps): Promise<void> {
    this.loadingSubject.next(true)
    this.currentSpaceProps = spaceProps
    return await this.initSpace(this.currentSpaceProps)
  }

  closeEmbed(): void {
    this.loadingSubject.next(false)
    this.spaceInitializedSubject.next(undefined)
  }
}
