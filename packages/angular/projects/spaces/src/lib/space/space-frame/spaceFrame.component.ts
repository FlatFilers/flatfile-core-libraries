import { Component, Input, OnInit } from "@angular/core";
import { ISpace, SimpleOnboarding } from "@flatfile/embedded-utils";
import { Browser, FlatfileEvent } from '@flatfile/listener';

import addSpaceInfo from '../../../utils/addSpaceInfo';
import authenticate from "../../../utils/authenticate";
import createSimpleListener from "../../../utils/createSimpleListener";
import { SpaceCloseModalPropsType } from "../space-close-modal/spaceCloseModal.component";
import { getContainerStyles, getIframeStyles } from "./embeddedStyles";

export type SpaceFramePropsType = ISpace & { 
  spaceId: string; 
  spaceUrl: string; 
  localAccessToken: string;
  handleCloseInstance: () => void;
  closeInstance: boolean;
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
  handlePostMessageInstance: ((event: MessageEvent<{ flatfileEvent: FlatfileEvent }>) => void) = () => {}

  @Input({required: true}) spaceFrameProps: SpaceFramePropsType  = {} as SpaceFramePropsType
  @Input({required: true}) loading: boolean = false

  async created() {
    const { listener, apiUrl, closeSpace, workbook } = this.spaceFrameProps;
    const accessToken = this.spaceFrameProps.localAccessToken

    const simpleListenerSlug = workbook?.sheets?.[0].slug || 'slug'
    const listenerInstance = listener || createSimpleListener({
      onRecordHook: (this.spaceFrameProps as SimpleOnboarding).onRecordHook,
      onSubmit: (this.spaceFrameProps as SimpleOnboarding).onSubmit,
      slug: simpleListenerSlug,
    })

    if (listenerInstance && typeof apiUrl === 'string') {
      listenerInstance.mount(
        new Browser({
          apiUrl,
          accessToken,
          fetchApi: fetch,
        })
      )
    }

    const dispatchEvent = (event: any) => {
      if (!event) return

      const eventPayload = event.src ? event.src : event
      const eventInstance = new FlatfileEvent(eventPayload, accessToken, apiUrl)

      return listenerInstance?.dispatchEvent(eventInstance)
    }

    const handlePostMessage = (event: MessageEvent<{ flatfileEvent:FlatfileEvent }>) => {
      const { flatfileEvent } = event.data
      if (!flatfileEvent) return
      if (
        flatfileEvent.topic === 'job:outcome-acknowledged' &&
        flatfileEvent.payload.status === 'complete' &&
        flatfileEvent.payload.operation === closeSpace?.operation
      ) {
        closeSpace?.onClose({})
      }
      dispatchEvent(flatfileEvent)
    }

    window.addEventListener('message', handlePostMessage, false)
    this.handlePostMessageInstance = handlePostMessage
  }

  async initializeSpace() {
    await this.created()
    const {
      publishableKey,
      workbook,
      environmentId,
      document,
      themeConfig,
      sidebarConfig,
      userInfo,
      spaceId,
      apiUrl = "https://platform.flatfile.com/api"
    } = this.spaceFrameProps;
    
    const accessToken = this.spaceFrameProps.localAccessToken;
    
    if(publishableKey) {
      const fullAccessApi = authenticate(accessToken, apiUrl);
      await addSpaceInfo({
        publishableKey,
        workbook, 
        environmentId, 
        document, 
        themeConfig, 
        sidebarConfig, 
        userInfo
      }, spaceId, fullAccessApi);
    }
    
  }

  openCloseModalDialog() {
    this.showExitWarnModal = true
  }

  handleConfirm() {
    const { closeSpace, handleCloseInstance } = this.spaceFrameProps
    closeSpace?.onClose({})
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

    this.initializeSpace()

    this.spaceCloseModalProps = {
      onConfirm: this.handleConfirm.bind(this),
      onCancel: this.handleCancel.bind(this),
      exitText,
      exitTitle,
      exitPrimaryButtonText,
      exitSecondaryButtonText,
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handlePostMessageInstance)
  }
}

export {}

declare global {
  interface Window {
    CROSSENV_FLATFILE_API_KEY: string
  }
}
