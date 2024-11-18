import { Component, Input, OnInit } from '@angular/core'
import {
  type ISpace,
  type ReusedSpaceWithAccessToken,
  type SimpleOnboarding,
  createWorkbookFromSheet,
  initNewSpace,
  InitialResourceData,
} from '@flatfile/embedded-utils'
import getSpace from '../../utils/getSpace'
import { SpaceFramePropsType } from './space-frame/spaceFrame.component'
import { SpaceService } from './space.service'
import { Flatfile } from '@flatfile/api'
import { filter } from 'rxjs'

type ReusedOrOnboarding = ReusedSpaceWithAccessToken | SimpleOnboarding

@Component({
  selector: 'flatfile-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class Space implements OnInit {
  @Input() spaceProps!: ISpace
  @Input() openDirectly: boolean = false

  title = 'Space'
  localSpaceData: Record<string, any> | undefined
  spaceFrameProps: SpaceFramePropsType | undefined
  error: { message: string } | undefined
  loading: boolean = false
  closeInstance: boolean = false

  constructor(private readonly appService: SpaceService) {
    console.log('Space constructor')
  }

  async ngOnInit() {
    if (!this.spaceProps) throw new Error('Please define the space props')
    console.log('ngOnInit', { spaceProps: this.spaceProps })

    if (this.openDirectly) {
      const response = await this.appService.initSpace(this.spaceProps)
      console.log('ngOnInit[this.openDirectly]', { response })
      this.spaceFrameProps = {
        ...this.spaceProps,
        ...this.localSpaceData,
        apiUrl: response.apiUrl || 'https://platform.flatfile.com/api',
        workbook: response.workbook || response.workbooks?.[0],
        handleCloseInstance: this.handleCloseInstance,
      } as SpaceFramePropsType
      this.loading = true
    } else {
      console.log('ngOnInit[!this.openDirectly]', {
        'this.appService.loading$': this.appService.loading$,
      })
      this.appService.spaceInitialized$.subscribe(async (initialized) => {
        console.log('Space ngOnInit spaceInitialized', { initialized })
        console.log('Space ngOnInit spaceResponse', {
          spaceResponse: this.appService.spaceResponse,
        })
        // if (initialized) {
        //   const response = await this.appService.initSpace(this.spaceProps);
        if (this.appService.spaceResponse) {
          const {
            id: spaceId,
            accessToken,
            guestLink,
          } = this.appService.spaceResponse.space

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

          this.spaceFrameProps = {
            ...this.spaceProps,
            ...this.localSpaceData,
            workbook:
              this.appService.spaceResponse.workbook ||
              this.appService.spaceResponse.workbooks?.[0],
            handleCloseInstance: this.handleCloseInstance,
          } as SpaceFramePropsType
        }
        this.loading = !initialized
      })
    }
  }

  handleCloseInstance() {
    this.closeInstance = true
  }

  // getOrCreateSpace = async (
  //   spaceProps: ReusedOrOnboarding
  // ): Promise<Partial<InitialResourceData> & { space: Flatfile.Space }> => {
  //   const {
  //     publishableKey,
  //     workbook,
  //     document,
  //     themeConfig,
  //     sidebarConfig,
  //     userInfo,
  //     apiUrl,
  //   } = spaceProps
  //   if (!publishableKey) {
  //     return await getSpace(spaceProps)
  //   } else {
  //     let createdWorkbook = workbook
  //     let isAutoConfig = false

  //     if (!createdWorkbook) {
  //       if (!spaceProps.sheet) {
  //         isAutoConfig = true
  //       } else {
  //         createdWorkbook = createWorkbookFromSheet(
  //           spaceProps.sheet,
  //           !!spaceProps.onSubmit
  //         )
  //       }
  //     }

  //     return await initNewSpace({
  //       publishableKey,
  //       workbook: createdWorkbook,
  //       document,
  //       themeConfig,
  //       sidebarConfig,
  //       userInfo,
  //       isAutoConfig,
  //       apiUrl: apiUrl || 'https://platform.flatfile.com/api',
  //     })
  //   }
  // }

  // initSpace = async (spaceProps: ReusedOrOnboarding) => {
  //   this.closeInstance = false

  //   try {
  //     this.loading = true
  //     const spaceResponse = await this.getOrCreateSpace(spaceProps)
  //     console.log('initSpace', { spaceResponse })
  //     const { id: spaceId, accessToken, guestLink } = spaceResponse.space

  //     if (!spaceId || typeof spaceId !== 'string') {
  //       throw new Error('Missing spaceId from space response')
  //     }

  //     if (!guestLink || typeof guestLink !== 'string') {
  //       throw new Error('Missing guest link from space response')
  //     }

  //     if (!accessToken || typeof accessToken !== 'string') {
  //       throw new Error('Missing access token from space response')
  //     }

  //     this.localSpaceData = {
  //       spaceId,
  //       spaceUrl: guestLink,
  //       localAccessToken: accessToken,
  //     }

  //     this.loading = false

  //     this.spaceFrameProps = {
  //       ...this.spaceProps,
  //       ...this.localSpaceData,
  //       apiUrl: spaceProps.apiUrl || 'https://platform.flatfile.com/api',
  //       workbook: spaceProps.workbook || spaceResponse.workbooks?.[0],
  //       handleCloseInstance: this.handleCloseInstance,
  //     } as SpaceFramePropsType
  //   } catch (error) {
  //     this.loading = false
  //     this.error = error as Error
  //     throw error
  //   }
  // }
}
