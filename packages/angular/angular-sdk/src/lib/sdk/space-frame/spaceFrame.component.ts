import { Component, Input, OnInit } from '@angular/core'
import {
  ISpace,
  SimpleOnboarding,
  handlePostMessage,
} from '@flatfile/embedded-utils'
import { Browser, FlatfileEvent } from '@flatfile/listener'

import addSpaceInfo from '../../../utils/addSpaceInfo'
import authenticate from '../../../utils/authenticate'
import { SpaceCloseModalPropsType } from '../space-close-modal/spaceCloseModal.component'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'
import {
  createListener,
  initNewSpace,
  createSimpleListener,
} from '@flatfile/javascript'
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
export class SpaceFrame implements OnInit {
  title = 'space-frame'
  showExitWarnModal = false
  spaceCloseModalProps: SpaceCloseModalPropsType =
    {} as SpaceCloseModalPropsType
  iframeWrapperStyle = {}
  iframeStyle = {}
  handlePostMessageInstance: (
    event: MessageEvent<{ flatfileEvent: FlatfileEvent }>
  ) => void = () => {}

  @Input({ required: true }) spaceFrameProps: SpaceFramePropsType =
    {} as SpaceFramePropsType
  @Input({ required: true }) loading: boolean = false

  async created() {
    console.log('CREATED!! 🚀🚀🚀')
    const { listener, apiUrl, closeSpace, workbook, space } =
      this.spaceFrameProps
    const accessToken = this.spaceFrameProps.localAccessToken
    let removeMessageListener: (() => void) | undefined
    const simpleListenerSlug = workbook?.sheets?.[0].slug || 'slug'

    if (listener) {
      removeMessageListener = await createListener(
        accessToken,
        apiUrl!,
        listener,
        closeSpace,
        () => {},
        () => {}
      )
    } else {
      removeMessageListener = await createListener(
        accessToken,
        apiUrl!,
        createSimpleListener({
          onRecordHook: (this.spaceFrameProps as SimpleOnboarding).onRecordHook,
          onSubmit: (this.spaceFrameProps as SimpleOnboarding).onSubmit,
          slug: simpleListenerSlug,
          submitSettings: (this.spaceFrameProps as SimpleOnboarding)
            .submitSettings,
        }),
        closeSpace,
        () => {},
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
    handleCloseInstance && handleCloseInstance()
  }

  handleCancel() {
    this.showExitWarnModal = false
  }

  ngOnInit(): void {
    const {
      spaceId,
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
      throw new Error('please wait until access token is recieved')
    const accessToken = this.spaceFrameProps.localAccessToken

    window.CROSSENV_FLATFILE_API_KEY = accessToken

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
    window.removeEventListener('message', this.handlePostMessageInstance)
  }
}

declare global {
  interface Window {
    CROSSENV_FLATFILE_API_KEY: string
  }
}
