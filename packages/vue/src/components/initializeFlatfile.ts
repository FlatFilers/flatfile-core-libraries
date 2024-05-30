import { ref, reactive, toRefs, h } from 'vue'
import { initializeSpace } from '../utils/initializeSpace'
import getSpace from '../utils/getSpace'
import {
  ISpace,
  ReusedSpaceWithAccessToken,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import SpaceC from './SpaceC.vue'
import SpinnerC from './Spinner.vue'
import DefaultError from './DefaultError.vue'

interface State {
  localSpaceId: string
  accessTokenLocal: string
  spaceUrl: string
  workbook: any
}
export const initializeFlatfile = (props: ISpace) => {
  const {
    error: ErrorElement,
    errorTitle,
    loading: LoadingElement,
    apiUrl = 'https://platform.flatfile.com/api',
  } = props

  const initError = ref<Error | null>(null)
  const closeInstance = ref<boolean>(false)
  const loading = ref<boolean>(false)
  const state = reactive<State>({
    localSpaceId: '',
    accessTokenLocal: '',
    spaceUrl: '',
    workbook: null,
  })

  const { localSpaceId, spaceUrl, accessTokenLocal, workbook } = toRefs(state)

  const initSpace = async () => {
    closeInstance.value = false
    try {
      loading.value = true
      const result =
        props.publishableKey && !props?.space
          ? await initializeSpace(props as SimpleOnboarding)
          : await getSpace(props as ReusedSpaceWithAccessToken)

      const data = result?.space?.data
      const workbook = result?.workbook

      if (!data) {
        throw new Error('Failed to initialize space')
      }

      const { id: spaceId, accessToken, guestLink } = data

      if (!spaceId) {
        throw new Error('Missing spaceId from space response')
      }

      if (!guestLink) {
        throw new Error('Missing guest link from space response')
      }

      state.localSpaceId = spaceId
      state.spaceUrl = guestLink

      if (!accessToken) {
        throw new Error('Missing access token from space response')
      }

      state.accessTokenLocal = accessToken

      state.workbook = workbook
      loading.value = false
    } catch (error) {
      initError.value = error as Error
    }
  }

  const errorElement =
    ErrorElement && initError.value
      ? ErrorElement(initError.value)
      : h(DefaultError, { error: errorTitle || initError.value })

  const loadingElement = LoadingElement || h(SpinnerC)
  const handleCloseInstance = () => {
    closeInstance.value = true
  }

  return {
    OpenEmbed: initSpace,
    Space: () => {
      if (closeInstance.value) {
        return null
      }

      if (loading.value) {
        return loadingElement
      }

      if (initError.value) {
        return errorElement
      }

      if (localSpaceId.value && accessTokenLocal.value && spaceUrl.value) {
        return h(SpaceC, {
          key: localSpaceId.value,
          spaceId: localSpaceId.value,
          spaceUrl: spaceUrl.value,
          accessToken: accessTokenLocal.value,
          workbook: workbook.value,
          handleCloseInstance,
          apiUrl,
          ...props,
        })
      }

      return null
    },
  }
}

export default initializeFlatfile
