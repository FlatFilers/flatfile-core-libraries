import { ref } from '@vue/runtime-dom'
import {
  SimpleOnboarding,
  getErrorMessage,
  createWorkbookFromSheet,
} from '@flatfile/embedded-utils'
import authenticate from './authenticate'

const useInitializeSpace = (flatfileOptions: SimpleOnboarding) => {
  const space = ref()
  const createdWorkbook = ref()

  const initializeSpace = async () => {
    try {
      const {
        publishableKey,
        environmentId,
        name = 'Embedded Space',
        spaceBody,
        apiUrl,
        spaceUrl = 'https://spaces.flatfile.com/',
        workbook,
        sheet,
        onSubmit,
      } = flatfileOptions

      if (!publishableKey) {
        throw new Error('Missing required publishable key')
      }

      const limitedAccessApi = authenticate(publishableKey, apiUrl)
      const spaceRequestBody = {
        name,
        autoConfigure: false,
        ...spaceBody,
      }

      createdWorkbook.value = workbook
      if (!createdWorkbook.value && !sheet) {
        spaceRequestBody.autoConfigure = true
      }

      if (!createdWorkbook.value && sheet) {
        createdWorkbook.value = createWorkbookFromSheet(sheet, !!onSubmit)
      }

      try {
        space.value = await limitedAccessApi.spaces.create({
          ...(environmentId !== undefined && { environmentId }),
          ...spaceRequestBody,
        })
      } catch (error) {
        throw new Error(`Failed to create space: ${getErrorMessage(error)}`)
      }

      if (!space.value) {
        throw new Error(
          `Failed to create space: Error parsing token: ${publishableKey}`
        )
      }

      if (!space.value.data.accessToken) {
        throw new Error('Failed to retrieve accessToken')
      }

      if (!space.value.data.guestLink) {
        const guestLink = `${spaceUrl}space/${space.value.data.id}?token=${space.value.data.accessToken}`
        space.value.data.guestLink = guestLink
      }

      return space.value
    } catch (error) {
      const message = getErrorMessage(error)
      console.error(`Failed to initialize space: ${message}`)
      throw error
    }
  }

  return { space, initializeSpace, createdWorkbook }
}

export default useInitializeSpace
