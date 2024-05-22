import { FlatfileClient } from '@flatfile/api'
import { findDefaultPage } from './findDefaultPage'
import { DefaultPageType } from '../types'

export async function updateDefaultPageInSpace(
  space: any,
  defaultPage: DefaultPageType
) {
  const defaultPageDetails = findDefaultPage(space, defaultPage)

  if (defaultPageDetails) {
    const api = new FlatfileClient()
    try {
      const updatedSpace = await api.spaces.update(space.space.id, {
        metadata: {
          ...space.space.metadata,
          sidebarConfig: {
            ...space.space.metadata.sidebarConfig,
            defaultPage: defaultPageDetails,
          },
        },
      })

      space.space.metadata.sidebarConfig = {
        ...space.space.metadata.sidebarConfig,
        defaultPage: updatedSpace.data.metadata.sidebarConfig.defaultPage,
      }
    } catch (error) {
      console.error('Failed to add the defaultPage to the Space:', error)
      throw error
    }
  }
}
