import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import type {
  ISpace,
  ReusedSpaceWithAccessToken,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import getSpace from '../../utils/getSpace'
import useInitializeSpace from '../../utils/useInitializeSpace'
import { SpaceFramePropsType } from './space-frame/spaceFrame.component'
import { SpaceService } from './space.service'

type ReusedOrOnboarding = ReusedSpaceWithAccessToken | SimpleOnboarding
@Component({
  selector: 'flatfile-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Space implements OnInit, OnChanges {
  @Input({ required: true }) spaceProps: ISpace = {} as ISpace
  @Input() openDirectly: boolean = false

  title = 'Space'
  localSpaceData: Record<string, any> | undefined
  spaceFrameProps: SpaceFramePropsType | undefined
  error: { message: string } | undefined
  loading: boolean = false
  closeInstance: boolean = false

  constructor(
    private appService: SpaceService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.spaceProps) throw new Error('Please define the space props')

    if (this.openDirectly) {
      await this.initSpace(this.spaceProps)
    } else {
      this.appService.signal.subscribe(async (event) => {
        if (event) {
          await this.initSpace(this.spaceProps)
        }
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('spaceProps' in changes && !changes['spaceProps'].firstChange) {
      this.spaceProps = {
        ...this.spaceProps,
        ...changes['spaceProps'].currentValue,
      }
    }
  }

  handleCloseInstance = () => {
    this.closeInstance = true
  }

  initSpace = async (spaceProps: ReusedOrOnboarding) => {
    this.changeDetectorRef.markForCheck()
    this.closeInstance = false
    const { initializeSpace } = useInitializeSpace(
      spaceProps as SimpleOnboarding
    )

    try {
      this.loading = true
      const { space, workbook } = this.spaceProps.publishableKey
        ? await initializeSpace()
        : await getSpace(spaceProps)
      const { id: spaceId, accessToken, guestLink } = space.data

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
        workbook,
        handleCloseInstance: this.handleCloseInstance,
      } as SpaceFramePropsType
    } catch (error) {
      console.log('error', error)
      this.loading = false
      this.error = error as Error
      throw new Error(`An error has occurred: ${error}`)
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }
}
