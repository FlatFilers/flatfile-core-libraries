import authenticate from './authenticate'
import {
  getErrorMessage,
  SimpleOnboarding,
  createWorkbookFromSheet,
} from '@flatfile/embedded-utils'
import { Flatfile } from '@flatfile/api'

export const initializeSpace = async (
  flatfileOptions: SimpleOnboarding
): Promise<{
  space: any
  workbook?: Flatfile.CreateWorkbookConfig
}> => {
  let space
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

  try {
    if (!publishableKey) {
      throw new Error('Missing required publishable key')
    }

    const limitedAccessApi = authenticate(publishableKey, apiUrl)
    const spaceRequestBody = {
      name,
      autoConfigure: false,
      labels: ['embedded'],
      ...spaceBody,
    }

    let createdWorkbook = workbook
    if (!createdWorkbook && !sheet) {
      spaceRequestBody.autoConfigure = true
    }

    if (!createdWorkbook && sheet) {
      createdWorkbook = createWorkbookFromSheet(sheet, !!onSubmit)
    }

    try {
      space = await limitedAccessApi.spaces.create({
        ...(environmentId !== undefined && { environmentId }),
        ...spaceRequestBody,
      })
    } catch (error) {
      throw new Error(`Failed to create space: ${getErrorMessage(error)}`)
    }

    if (!space) {
      throw new Error(
        `Failed to create space: Error parsing token: ${publishableKey}`
      )
    }
    if (!space.data.accessToken) {
      throw new Error('Failed to retrieve accessToken')
    }

    if (!space.data.guestLink) {
      const guestLink = `${spaceUrl}space/${space.data.id}?token=${space.data.accessToken}`
      space.data.guestLink = guestLink
    }

    return { space, workbook: createdWorkbook }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`Failed to initialize space: ${message}`)
    throw error
  }
}
