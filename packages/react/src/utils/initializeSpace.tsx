import { Flatfile } from '@flatfile/api'
import { IReactSpaceProps } from '../types'
import { authenticate } from './authenticate'
import { getErrorMessage } from '@flatfile/embedded-utils'

export const initializeSpace = async (
  flatfileOptions: IReactSpaceProps
): Promise<Flatfile.SpaceResponse> => {
  let space
  const {
    publishableKey,
    environmentId,
    name = 'Embedded Space',
    spaceBody,
    apiUrl,
    spaceUrl = 'https://platform.flatfile.com/s/',
    workbook,
    themeConfig,
    sidebarConfig,
    spaceInfo,
    userInfo,
    metadata,
    namespace,
    labels,
    translationsPath,
    languageOverride,
  } = flatfileOptions

  try {
    if (!publishableKey) {
      throw new Error('Missing required publishable key')
    }

    if (!environmentId) {
      throw new Error('Missing required environment id')
    }

    const limitedAccessApi = authenticate(publishableKey, apiUrl)
    const createSpaceRequest = {
      name,
      namespace,
      autoConfigure: false,
      environmentId,
      ...spaceBody,
      labels: ['embedded', ...(labels || [])],
      translationsPath,
      languageOverride,
      metadata: {
        ...metadata,
        theme: themeConfig,
        sidebarConfig: sidebarConfig ? sidebarConfig : { showSidebar: false },
        userInfo,
        spaceInfo,
        ...(spaceBody?.metadata || {}),
        ...(metadata || {}),
      },
    }

    if (!workbook) {
      createSpaceRequest.autoConfigure = true
    }
    try {
      space = await limitedAccessApi.spaces.create(createSpaceRequest)
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

    return space
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`Failed to initialize space: ${message}`)
    throw error
  }
}
