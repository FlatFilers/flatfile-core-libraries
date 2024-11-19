import { Component, effect, Input, OnInit } from '@angular/core'
import { type ISpace } from '@flatfile/embedded-utils'
import { SpaceFramePropsType } from './space-frame/spaceFrame.component'
import { SpaceService } from './space.service'

@Component({
  selector: 'flatfile-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class Space implements OnInit {
  @Input() spaceProps!: ISpace
  @Input() openDirectly = false
  @Input() config?: {
    resetOnClose: boolean
  } = {
    resetOnClose: true,
  }

  readonly title = 'Space'
  spaceFrameProps?: SpaceFramePropsType
  error?: { message: string }
  loading = false
  closeInstance = false

  constructor(private readonly spaceService: SpaceService) {
    effect(() => {
      this.loading = this.spaceService.loading()
      this.spaceFrameProps = this.spaceService.spaceInitialized()
        ? ({
            ...this.spaceService.spaceInitialized(),
            handleCloseInstance: this.handleCloseInstance.bind(this),
          } as SpaceFramePropsType)
        : undefined
    })
  }

  async ngOnInit(): Promise<void> {
    if (!this.spaceProps) {
      throw new Error('Please define the space props')
    }
    this.spaceService.config = this.config
    if (this.openDirectly) {
      await this.spaceService.initSpace(this.spaceProps)
    }
  }

  handleCloseInstance(): void {
    this.closeInstance = true
    this.spaceFrameProps = undefined
  }
}
