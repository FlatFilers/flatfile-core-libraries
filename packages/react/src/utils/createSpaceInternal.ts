import { CREATE_SPACE_INTERNAL } from '../types/ICreateSpaceInternal'

export const createSpaceInternal = async ({
  apiUrl,
  publishableKey,
  space,
  workbook,
  document,
}: CREATE_SPACE_INTERNAL) => {
  const createSpaceEndpoint = `${apiUrl}/v1/internal/spaces/init?publishableKey=${publishableKey}`

  let spaceRequestBody: any = {
    space,
  }

  if (workbook) {
    spaceRequestBody = {
      ...spaceRequestBody,
      workbook,
    }
  }

  if (document) {
    spaceRequestBody = {
      ...spaceRequestBody,
      document,
    }
  }

  try {
    const response = await fetch(createSpaceEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(spaceRequestBody),
    })
    return await response.json()
  } catch (e) {
    console.error('Error creating space', e)
    throw e
  }
}
