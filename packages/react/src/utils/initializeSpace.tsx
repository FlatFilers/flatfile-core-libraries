import { ISpace } from '../types/ISpace'
import { addSpaceInfo } from './addSpaceInfo'
import { authenticate } from './authenticate'
import { getErrorMessage } from './getErrorMessage'

export const initializeSpace = async (spaceProps: ISpace) => {
  let space
  const { 
    publishableKey,
    apiUrl,
    name = 'Embedded Space'
  } = spaceProps

  try {
    if (!publishableKey) {
      throw new Error('Missing required publishable key')
    }

    const limitedAccessApi = authenticate(publishableKey, apiUrl)
    try {
      space = await limitedAccessApi.spaces.create({
        name
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

    const fullAccessApi = authenticate(space.data.accessToken, apiUrl)
    await addSpaceInfo(spaceProps, space.data.id, fullAccessApi)
    return space
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`Failed to initialize space: ${message}`)
    throw error
  }
}
