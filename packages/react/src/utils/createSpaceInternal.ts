import { Flatfile } from '@flatfile/api'

type CreateSpaceinternal = {
  apiUrl: string
  publishableKey: string
  space: Flatfile.SpaceConfig
  workbook?: Flatfile.CreateWorkbookConfig
  document?: Flatfile.DocumentConfig
}

export const createSpaceInternal = async ({
  apiUrl,
  publishableKey,
  space,
  workbook,
  document,
}: CreateSpaceinternal) => {
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

  console.log('createSpaceInternal', { createSpaceEndpoint, spaceRequestBody })

  const response = await fetch(createSpaceEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'text/plain',
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(spaceRequestBody),
  })

  const result = await response.json()
  return result
}
