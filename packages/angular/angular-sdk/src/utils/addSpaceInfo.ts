import { FlatfileClient } from '@flatfile/api'
import {
  NewSpaceFromPublishableKey,
  getErrorMessage,
} from '@flatfile/embedded-utils'

const addSpaceInfo = async (
  spaceProps: NewSpaceFromPublishableKey,
  spaceId: string,
  api: FlatfileClient
) => {
  const {
    workbook,
    environmentId,
    document,
    themeConfig,
    sidebarConfig,
    spaceInfo,
    userInfo,
  } = spaceProps

  try {
    if (workbook) {
      const localWorkbook = await api.workbooks.create({
        spaceId,
        ...(environmentId ? { environmentId } : {}),
        ...workbook,
      })
      if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
        throw new Error('Failed to create workbook')
      }
    }

    const updatedSpace = await api.spaces.update(spaceId, {
      ...(environmentId ? { environmentId } : {}),
      metadata: {
        theme: themeConfig,
        sidebarConfig: sidebarConfig || { showSidebar: false },
        userInfo,
        spaceInfo,
      },
    })

    if (!updatedSpace) {
      throw new Error('Failed to update space')
    }

    if (document) {
      const createdDocument = await api.documents.create(spaceId, {
        title: document.title,
        body: document.body,
      })

      if (
        !createdDocument ||
        !createdDocument.data ||
        !createdDocument.data.id
      ) {
        throw new Error('Failed to create document')
      }
    }
  } catch (error) {
    const message = getErrorMessage(error)
    throw new Error(`Error adding workbook to space: ${message}`)
  }
}

export default addSpaceInfo
