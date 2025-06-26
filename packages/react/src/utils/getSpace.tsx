import { Flatfile } from '@flatfile/api'
import { getErrorMessage } from '@flatfile/embedded-utils'
import { IReactSpaceProps } from '../types'

export const getSpace = async (
  spaceProps: IReactSpaceProps
): Promise<Flatfile.SpaceResponse> => {
  const {
    space,
    apiUrl,
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

    try {
      const response = await fetch(`${apiUrl}/v1/spaces/${space.id}`, {
        headers: {
          Authorization: `Bearer ${space.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(
          `Failed to get space: ${response.status} ${response.statusText}`
        )
      }

      spaceResponse = await response.json()
    } catch (error) {
      throw new Error(`Failed to get space: ${getErrorMessage(error)}`)
    }

    if (!spaceResponse.data.accessToken) {
      throw new Error('Failed to retrieve accessToken')
    }

    if (!spaceResponse.data.guestLink) {
      const normalizedSpaceUrl = spaceUrl.endsWith('/')
        ? spaceUrl.slice(0, -1)
        : spaceUrl
      const guestLink = `${normalizedSpaceUrl}/space/${space?.id}?token=${spaceResponse.data.accessToken}`
      spaceResponse.data.guestLink = guestLink
    }

    return spaceResponse
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`Failed to initialize space: ${message}`)
    throw error
  }
}
