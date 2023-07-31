import { FlatfileClient } from '@flatfile/api'
import { ISpace } from '../types/ISpace'
import { getErrorMessage } from './getErrorMessage'

// Given the space is created, add workbook, metadata and document to the space
export const addSpaceInfo = async (
  spaceProps: ISpace,
  spaceId: string,
  api: FlatfileClient
) => {
  const {
    workbook,
    document,
    themeConfig,
    sidebarConfig,
    spaceInfo
  } = spaceProps

  try {
    const localWorkbook = await api.workbooks.create({
      sheets: workbook.sheets,
      name: workbook.name,
      actions: workbook.actions,
      spaceId,
    })

    if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
      throw new Error('Failed to create workbook')
    }

    const updatedSpace = await api.spaces.update(spaceId, {
      metadata: {
        theme: themeConfig,
        sidebarConfig,
        spaceInfo
      }
    })

    if (!updatedSpace) {
      throw new Error('Failed to update space')
    }

    if (document) {
      const createdDocument = await api.documents.create(spaceId, {
        title: document.title,
        body: document.body
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
