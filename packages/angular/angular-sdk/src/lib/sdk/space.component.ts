import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { Flatfile } from '@flatfile/api'
import {
  type ISpace,
  InitialResourceData,
  type ReusedSpaceWithAccessToken,
  type SimpleOnboarding,
  createWorkbookFromSheet,
  initNewSpace,
} from '@flatfile/embedded-utils'
import getSpace from '../../utils/getSpace'
import { SpaceFramePropsType } from './space-frame/spaceFrame.component'
import { SpaceService } from './space.service'

type ReusedOrOnboarding = ReusedSpaceWithAccessToken | SimpleOnboarding

@Component({
  selector: 'flatfile-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class Space implements OnInit, OnChanges {
  @Input() spaceProps!: ISpace
  @Input() openDirectly: boolean = false

  title = 'Space'
  localSpaceData: Record<string, any> | undefined
  spaceFrameProps: SpaceFramePropsType | undefined
  error: { message: string } | undefined
  loading: boolean = false
  closeInstance: boolean = false

  constructor(
    private readonly appService: SpaceService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.spaceProps) throw new Error('Please define the space props')

    if (this.openDirectly) {
      await this.initSpace(this.spaceProps)
    } else {
      this.appService.signal.subscribe(async () => {
        await this.initSpace(this.spaceProps)
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('spaceProps' in changes && !changes['spaceProps'].firstChange) {
      this.spaceProps = {
        ...this.spaceProps,
        ...changes['spaceProps'].currentValue,
      }
      this.changeDetectorRef.markForCheck()
    }
  }

  handleCloseInstance() {
    this.closeInstance = true
  }

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

  initSpace = async (spaceProps: ReusedOrOnboarding) => {
    this.changeDetectorRef.markForCheck()
    this.closeInstance = false

    try {
      this.loading = true
      const spaceResponse = await this.getOrCreateSpace(spaceProps)
      const { id: spaceId, accessToken, guestLink } = spaceResponse.space

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

      this.loading = false
      this.spaceFrameProps = {
        ...this.spaceProps,
        ...this.localSpaceData,
        apiUrl: spaceProps.apiUrl || 'https://platform.flatfile.com/api',
        workbook: spaceProps.workbook || spaceResponse.workbooks?.[0],
        handleCloseInstance: this.handleCloseInstance,
      } as SpaceFramePropsType
    } catch (error) {
      this.loading = false
      this.error = error as Error
      throw error
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }
}
