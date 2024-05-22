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
  }
}
