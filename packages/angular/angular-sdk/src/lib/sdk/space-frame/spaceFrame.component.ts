import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import {
  ISpace,
  SimpleOnboarding,
  createListener,
  createSimpleListener,
} from '@flatfile/embedded-utils'
import { FlatfileEvent } from '@flatfile/listener'
import { SpaceCloseModalPropsType } from '../space-close-modal/spaceCloseModal.component'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'
export type SpaceFramePropsType = ISpace & {
  spaceId: string
  spaceUrl: string
  localAccessToken: string
  handleCloseInstance: () => void
  closeInstance: boolean
}

@Component({
  selector: 'space-frame',
  templateUrl: './spaceFrame.component.html',
  styleUrls: ['./spaceFrame.component.scss'],
})
export class SpaceFrame implements OnInit, OnDestroy {
  title = 'space-frame'
  showExitWarnModal = false
  spaceCloseModalProps: SpaceCloseModalPropsType = {} as SpaceCloseModalPropsType
  iframeWrapperStyle = {}
  iframeStyle = {}
  handlePostMessageInstance: (
    event: MessageEvent<{ flatfileEvent: FlatfileEvent }>
  ) => void = () => {}

  @Input({ required: true }) spaceFrameProps: SpaceFramePropsType = {} as SpaceFramePropsType
  @Input({ required: true }) loading: boolean = false

  private removeMessageListener?: () => void
  private isDestroyed = false

  async created() {
    const { listener, apiUrl, closeSpace, workbook } = this.spaceFrameProps

    // Clean up any existing listener before creating a new one
    if (this.removeMessageListener) {
      this.removeMessageListener()
    }

    const accessToken = this.spaceFrameProps.localAccessToken
    const simpleListenerSlug = workbook?.sheets?.[0].slug || 'slug'

    if (listener) {
      this.removeMessageListener = await createListener(
        accessToken,
        apiUrl!,
        listener,
        closeSpace,
        () => this.removeMessageListener?.(),
        () => {}
      )
    } else {
      this.removeMessageListener = await createListener(
        accessToken,
        apiUrl!,
        createSimpleListener({
          onRecordHook: (this.spaceFrameProps as SimpleOnboarding).onRecordHook,
          onSubmit: (this.spaceFrameProps as SimpleOnboarding).onSubmit,
          slug: simpleListenerSlug,
          submitSettings: (this.spaceFrameProps as SimpleOnboarding).submitSettings,
        }),
        closeSpace,
        () => this.removeMessageListener?.(),
        () => {}
      )
    }
  }

  openCloseModalDialog() {
    this.showExitWarnModal = true
  }

  handleConfirm() {
    const { closeSpace, handleCloseInstance } = this.spaceFrameProps
    if (closeSpace?.onClose && typeof closeSpace.onClose === 'function') {
      closeSpace.onClose({})
    }
    this.removeMessageListener?.()
    handleCloseInstance && handleCloseInstance()
  }

  handleCancel() {
    this.showExitWarnModal = false
  }

  ngOnInit(): void {
    const {
      exitText,
      exitTitle,
      exitPrimaryButtonText,
      exitSecondaryButtonText,
    } = this.spaceFrameProps

    this.iframeWrapperStyle = getContainerStyles(
      this.spaceFrameProps.displayAsModal || false
    )
    this.iframeStyle = getIframeStyles(this.spaceFrameProps.iframeStyles)

    if (!this.spaceFrameProps.localAccessToken)
      throw new Error('please wait until access token is received')
    
    window.CROSSENV_FLATFILE_API_KEY = this.spaceFrameProps.localAccessToken

    this.spaceCloseModalProps = {
      onConfirm: this.handleConfirm.bind(this),
      onCancel: this.handleCancel.bind(this),
      exitText,
      exitTitle,
      exitPrimaryButtonText,
      exitSecondaryButtonText,
    }

    this.created()
  }

  ngOnDestroy(): void {
    this.removeMessageListener?.()
    window.removeEventListener('message', this.handlePostMessageInstance)
  }
}

declare global {
  interface Window {
    CROSSENV_FLATFILE_API_KEY: string
  }
}
