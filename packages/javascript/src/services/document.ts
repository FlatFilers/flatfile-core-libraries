import { UpdateSpaceInfo } from '../..'

export const createDocument = async (data: UpdateSpaceInfo) => {
  const { apiUrl, accessToken, document, spaceId } = data
  const createDocumentEndpoint = `${apiUrl}/v1/spaces/${spaceId}/documents`
  const response = await fetch(createDocumentEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      title: document?.title,
      body: document?.body,
    }),
  })
  const createdDocument = await response.json()

  if (!createdDocument || !createdDocument.data || !createdDocument.data.id) {
    throw new Error('Failed to create document')
  }

  if (!response.ok) {
    const errorMessage =
      createdDocument?.errors[0]?.message || 'Failed to create document'
    throw new Error(errorMessage)
  }
}
