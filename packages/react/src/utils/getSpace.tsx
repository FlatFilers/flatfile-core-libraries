import { Flatfile } from '@flatfile/api'
import { getErrorMessage } from '@flatfile/embedded-utils'
import { authenticate } from './authenticate'
import { IReactSpaceProps } from '../types'

export const getSpace = async (
  spaceProps: IReactSpaceProps
): Promise<Flatfile.SpaceResponse> => {
  const {
    space,
    apiUrl,
    environmentId,
    spaceUrl = 'https://platform.flatfile.com/s/',
  } = spaceProps
  let spaceResponse
  try {
    if (!space?.id) {
      throw new Error('Missing required ID for Space')
    }
    if (!space?.accessToken) {
      throw new Error('Missing required accessToken for Space')
    }

    if (!environmentId) {
      throw new Error('Missing required environment id')
    }

    const limitedAccessApi = authenticate(space?.accessToken, apiUrl)
    try {
      spaceResponse = await limitedAccessApi.spaces.get(space?.id)
    } catch (error) {
      throw new Error(`Failed to get space: ${getErrorMessage(error)}`)
    }

    if (!spaceResponse.data.accessToken) {
      throw new Error('Failed to retrieve accessToken')
    }

    if (!spaceResponse.data.guestLink) {
      const guestLink = `${spaceUrl}space/${space?.id}?token=${spaceResponse.data.accessToken}`
      spaceResponse.data.guestLink = guestLink
    }

    return spaceResponse
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`Failed to initialize space: ${message}`)
    throw error
  }
}
