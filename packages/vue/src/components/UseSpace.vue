<template>
  <div>
    <DefaultError v-if="initError" :error="initError" />
    <SpaceC
      v-if="localSpaceId && spaceUrl && accessTokenLocal"
      :spaceId="localSpaceId"
      :spaceUrl="spaceUrl"
      :accessToken="accessTokenLocal"
      :apiUrl="apiUrl"
      :displayAsModal="displayAsModal"
      :exitText="exitText"
      :exitTitle="exitTitle"
      :workbook="createdWorkbook"
      :exitPrimaryButtonText="exitPrimaryButtonText"
      :exitSecondaryButtonText="exitSecondaryButtonText"
      :closeSpace="closeSpace"
      :listener="listener"
      :sidebarConfig="sidebarConfig"
      :spaceInfo="spaceInfo"
      :userInfo="userInfo"
      :document="document"
      :themeConfig="themeConfig"
      :environmentId="environmentId"
      :iframeStyles="iframeStyles"
      :onSubmit="onSubmit"
      :onRecordHook="onRecordHook"
    />
    <SpinnerC v-else></SpinnerC>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import useInitializeSpace from '../utils/useInitializeSpace'
import getSpace from '../utils/getSpace'
import SpaceC from './SpaceC.vue'
import SpinnerC from './Spinner.vue'
import DefaultError from './DefaultError.vue'

export default {
  props: {
    name: String,
    publishableKey: String,
    environmentId: String,
    closeSpace: Object,
    space: Object,
    themeConfig: Object,
    listener: Object,
    sidebarConfig: Object,
    document: Object,
    sheet: Object,
    spaceBody: Object,
    spaceInfo: Object,
    userInfo: Object,
    workbook: Object,
    onRecordHook: Function,
    onSubmit: Function,
    displayAsModal: Boolean,
    iframeStyles: Object,
    mountElement: {
      type: String,
      default: 'flatfile_iFrameContainer',
    },
    exitText: {
      type: String,
      default:
        'Are you sure you want to exit? Any unsaved changes will be lost.',
    },
    exitTitle: {
      type: String,
      default: 'Close Window',
    },
    exitPrimaryButtonText: {
      type: String,
      default: 'Yes, exit',
    },
    exitSecondaryButtonText: {
      type: String,
      default: 'No, stay',
    },
    apiUrl: {
      type: String,
      default: 'https://platform.flatfile.com/api',
    },
  },
  setup(props) {
    const { initializeSpace, createdWorkbook } = useInitializeSpace(props)
    const initError = ref(null)
    const localSpaceId = ref(null)
    const accessTokenLocal = ref(null)
    const spaceUrl = ref('')

    const initSpace = async () => {
      try {
        const data = props.publishableKey
          ? await initializeSpace(props)
          : await getSpace(props)

        if (!data) {
          throw new Error('Failed to initialize space')
        }

        const { id: spaceId, accessToken, guestLink } = data.data

        if (!spaceId) {
          throw new Error('Missing spaceId from space response')
        }

        if (!guestLink) {
          throw new Error('Missing guest link from space response')
        }

        if (!accessToken) {
          throw new Error('Missing access token from space response')
        }

        localSpaceId.value = spaceId
        spaceUrl.value = guestLink
        accessTokenLocal.value = accessToken
      } catch (error) {
        initError.value = error.message
      }
    }

    onMounted(() => {
      initSpace()
    })

    return {
      initSpace,
      initError,
      localSpaceId,
      spaceUrl,
      accessTokenLocal,
      createdWorkbook,
    }
  },
  components: {
    SpaceC,
    SpinnerC,
    DefaultError,
  },
}
</script>

<style lang="css">
@import url(./../main.css);
</style>
