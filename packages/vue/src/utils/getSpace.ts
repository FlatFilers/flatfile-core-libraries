import {
  ReusedSpaceWithAccessToken,
  getErrorMessage,
} from '@flatfile/embedded-utils'
import authenticate from './authenticate'
import { Flatfile } from '@flatfile/api'

type IWorkbook = Pick<
  Flatfile.CreateWorkbookConfig,
  'name' | 'sheets' | 'actions'
>
const getSpace = async (
  spaceProps: ReusedSpaceWithAccessToken
): Promise<{
  space: any
  workbook?: IWorkbook
}> => {
  const {
    space,
    apiUrl,
    environmentId,
    spaceUrl = 'https://spaces.flatfile.com/',
  } = spaceProps
  let spaceResponse
  let workbookResponse
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
      workbookResponse = await limitedAccessApi.workbooks.list({
        spaceId: space?.id,
      })
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

    const workbook = workbookResponse.data.length
      ? ({
          name: workbookResponse.data[0].name,
          sheets: workbookResponse.data[0].sheets,
          actions: workbookResponse.data[0].actions,
        } as IWorkbook)
      : undefined

    return { space: spaceResponse, workbook }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error(`Failed to initialize space: ${message}`)
    throw error
  }
}

export default getSpace
