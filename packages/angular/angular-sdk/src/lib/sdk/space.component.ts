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

  constructor(private readonly appService: SpaceService) {}

  async ngOnInit() {
    if (!this.spaceProps) throw new Error('Please define the space props')

    if (this.openDirectly) {
      await this.appService.initSpace(this.spaceProps)
    }
    const self = this
    this.appService.spaceInitialized$.subscribe(async (initialized) => {
      if (initialized) {
        this.spaceFrameProps = {
          ...initialized,
          handleCloseInstance: self.handleCloseInstance,
        } as SpaceFramePropsType
      }
      this.loading = !initialized
    })
  }

  handleCloseInstance() {
    this.closeInstance = true
  }
}
