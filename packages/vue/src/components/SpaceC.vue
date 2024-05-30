<template>
  <div
    class="flatfile_iframe-wrapper"
    :class="{ flatfile_displayAsModal: displayAsModal }"
    data-testid="space-contents"
    :style="getContainerStyles(displayAsModal)"
  >
    <ConfirmModal
      v-if="showExitWarnModal"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      :exitText="exitText"
      :exitTitle="exitTitle"
      :exitPrimaryButtonText="exitPrimaryButtonText"
      :exitSecondaryButtonText="exitSecondaryButtonText"
    />

    <iframe
      :class="mountElement"
      :data-testid="mountElement"
      :src="spaceUrl"
      :style="getIframeStyles(iframeStyles)"
      allow="clipboard-read; clipboard-write"
      id="flatfile_iframe"
      title="Embedded Portal Content"
    ></iframe>
    <div
      @click="showExitWarnModal = true"
      data-testid="flatfile-close-button"
      class="flatfile-close-button"
      style="position: absolute; margin: 30px"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 100 100"
      >
        <line
          x1="10"
          y1="10"
          x2="90"
          y2="90"
          stroke="white"
          :stroke-width="10"
        />
        <line
          x1="10"
          y1="90"
          x2="90"
          y2="10"
          stroke="white"
          :stroke-width="10"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import { handlePostMessage } from '@flatfile/embedded-utils'
import { Browser } from '@flatfile/listener'
import addSpaceInfo from '../utils/addSpaceInfo'
import authenticate from '../utils/authenticate'
import { createSimpleListener } from '../utils/createSimpleListener'
import ConfirmModal from './ConfirmCloseModal.vue'
import { getContainerStyles, getIframeStyles } from './embeddedStyles'

export default {
  props: {
    spaceId: String,
    environmentId: String,
    spaceUrl: String,
    listener: Object,
    accessToken: String,
    spaceBody: Object,
    closeSpace: Object,
    onRecordHook: Function,
    onSubmit: Function,
    handleCloseInstance: Function,
    document: Object,
    iframeStyles: Object,
    mountElement: String,
    exitText: String,
    exitTitle: String,
    workbook: Object,
    exitPrimaryButtonText: String,
    exitSecondaryButtonText: String,
    apiUrl: String,
    themeConfig: Object,
    displayAsModal: Boolean,
    sidebarConfig: Object,
    spaceInfo: Object,
    userInfo: Object,
  },

  components: {
    ConfirmModal,
  },

  data() {
    return {
      showExitWarnModal: false,
      listenerInstance: null,
      flatfileMessageHandler: null,
      browserInstance: null,
    }
  },
  methods: {
    handleConfirm() {
      this.closeSpace?.onClose({})
      this.handleCloseInstance && this.handleCloseInstance()
    },

    handleCancel() {
      this.showExitWarnModal = false
    },

    createListenerInstance() {
      const simpleListenerSlug =
        this.workbook?.sheets?.[0].slug ||
        this.workbook?.sheets?.[0].config.slug ||
        'slug'

      return (
        this.listener ||
        createSimpleListener({
          onRecordHook: this.onRecordHook,
          onSubmit: this.onSubmit,
          slug: simpleListenerSlug,
        })
      )
    },

    cleanupListener() {
      window.removeEventListener('message', this.flatfileMessageHandler)
      if (this.listenerInstance) {
        this.listenerInstance.unmount(this.browserInstance)
      }
    },
    getContainerStyles,
    getIframeStyles,
  },

  async mounted() {
    const {
      spaceId,
      accessToken,
      closeSpace,
      apiUrl,
      workbook,
      environmentId,
      document,
      themeConfig,
      sidebarConfig,
      spaceInfo,
      userInfo,
    } = this

    this.browserInstance = new Browser({
      apiUrl,
      accessToken,
      fetchApi: fetch,
    })

    window.CROSSENV_FLATFILE_API_KEY = accessToken

    const fullAccessApi = authenticate(accessToken, apiUrl)
    await addSpaceInfo(
      {
        workbook,
        environmentId,
        document,
        themeConfig,
        sidebarConfig,
        spaceInfo,
        userInfo,
      },
      spaceId,
      fullAccessApi
    )

    this.listenerInstance = this.createListenerInstance()
    this.flatfileMessageHandler = handlePostMessage(
      closeSpace,
      this.listenerInstance
    )

    this.listenerInstance.mount(this.browserInstance)
    window.addEventListener('message', this.flatfileMessageHandler, false)
  },

  beforeUnmount() {
    this.cleanupListener()
  },
}
</script>

<style lang="scss">
.flatfile_displayAsModal #flatfile_iframe {
  border-radius: var(--ff-border-radius);
  background: rgb(255, 255, 255);
}
.flatfile_displayAsModal .flatfile-close-button {
  position: absolute;
  z-index: 10;
  top: 35px;
  right: 35px;
  display: flex;
  justify-content: center;
  width: 25px;
  align-items: center;
  border-radius: 100%;
  cursor: pointer;
  border: none;
  background: #000;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  animation: glow 1.5s linear infinite alternate;
  transition: box-shadow 0.3s ease;
  height: 25px;
}
.flatfile_displayAsModal .flatfile-close-button:hover {
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.8);
}
.flatfile_displayAsModal .flatfile-close-button svg {
  fill: var(--ff-secondary-color);
  width: 10px;
}
.flatfile_iframe-wrapper {
  min-width: 768px;
  min-height: 600px;
  width: 992px;
  height: 600px;
}
.flatfile_iframe-wrapper.flatfile_displayAsModal {
  box-sizing: content-box;
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 60px); /* 30px padding on the left and right */
  max-width: 100vw; /* viewport width */
  height: calc(100vh - 60px); /* 30px padding on the top and bottom */
  padding: 30px;
  background: var(--ff-bg-fade);
  z-index: 1000;
}

.flatfile-close-button {
  text-align: center;
  position: relative;
  top: 20px;
  right: -20px;
  width: 25px;
  height: 25px;
  border-radius: 100%;
  cursor: pointer;
  border: none;
  background: #000;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  animation: glow 1.5s linear infinite alternate;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.8);
  }

  svg {
    fill: lightgray;
    width: 10px;
  }
}
#flatfile_iframe {
  border-width: 0px;
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
