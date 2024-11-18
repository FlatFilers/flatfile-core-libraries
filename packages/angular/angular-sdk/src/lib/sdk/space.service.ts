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
  public loading$: Observable<boolean> = this.loadingSubject.asObservable()

  private currentSpaceProps?: SpaceProps
  private spaceInitializedSubject = new BehaviorSubject<boolean>(false)
  public spaceInitialized$: Observable<boolean> =
    this.spaceInitializedSubject.asObservable()
  get spaceInitialized(): boolean {
    return this.spaceInitializedSubject.value
  }
  set spaceInitialized(value: boolean) {
    this.spaceInitializedSubject.next(value)
  }
  public spaceResponse: any

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
    console.log('initSpace', { spaceProps })
    if (!spaceProps) {
      console.log('spaceProps is required')
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
    console.log({ spaceProps })
    try {
      this.spaceResponse = await this.getOrCreateSpace(spaceProps)
      this.spaceInitializedSubject.next(true)
    } catch (error) {
      console.error('Failed to initialize space:', error)
      throw error
    }
  }

  async OpenEmbed(spaceProps: SpaceProps): Promise<void> {
    console.log('OpenEmbed', { this: this })
    this.loadingSubject.next(true)
    this.currentSpaceProps = spaceProps
    await this.initSpace(this.currentSpaceProps)
  }

  closeEmbed(): void {
    this.loadingSubject.next(false)
    this.spaceInitializedSubject.next(false)
    this.spaceInitialized = false
  }
}
