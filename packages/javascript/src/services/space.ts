import { UpdateSpaceInfo } from '../..'

export const updateSpace = async (data: UpdateSpaceInfo) => {
  const {
    apiUrl,
    accessToken,
    themeConfig,
    sidebarConfig,
    userInfo,
    spaceInfo,
    spaceId,
    environmentId,
    spaceBody,
  } = data
  const updateSpaceEndpoint = `${apiUrl}/v1/spaces/${spaceId}`
  const response = await fetch(updateSpaceEndpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      environmentId,
      metadata: {
        theme: themeConfig,
        sidebarConfig: sidebarConfig ? sidebarConfig : { showSidebar: false },
        userInfo,
        spaceInfo,
        ...(spaceBody?.metadata || {}),
      },
    }),
  })
  const updatedSpace = await response.json()

  if (!updatedSpace || !updatedSpace.data || !updatedSpace.data.id) {
    throw new Error('Failed to update space')
  }

  if (!response.ok) {
    const errorMessage =
      updatedSpace?.errors[0]?.message || 'Failed to update space'
    throw new Error(errorMessage)
  }

  return updatedSpace.data
}
