import { Component, effect, Input, OnInit, OnDestroy, EffectRef } from '@angular/core'
import { type ISpace } from '@flatfile/embedded-utils'
import { SpaceFramePropsType } from './space-frame/spaceFrame.component'
import { SpaceService } from './space.service'

@Component({
  selector: 'flatfile-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class Space implements OnInit, OnDestroy {
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
  private effectRef: EffectRef
  private isDestroyed = false

  constructor(private readonly spaceService: SpaceService) {
    this.effectRef = effect(() => {
      if (this.isDestroyed) return

      this.loading = this.spaceService.loading()
      const spaceInitialized = this.spaceService.spaceInitialized()
      
      if (spaceInitialized) {
        this.spaceFrameProps = {
          ...spaceInitialized,
          handleCloseInstance: this.handleCloseInstance.bind(this),
        } as SpaceFramePropsType
      } else {
        this.spaceFrameProps = undefined
      }
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
    this.spaceService.closeEmbed()
  }

  ngOnDestroy(): void {
    this.effectRef.destroy()
    this.spaceService.closeEmbed()
  }
}
