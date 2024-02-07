import { Flatfile, FlatfileClient } from '@flatfile/api'
import {
  createWorkbookFromSheet,
  getErrorMessage,
} from '@flatfile/embedded-utils'
import { IReactSimpleOnboarding } from '../types/IReactSimpleOnboarding'

// Given the space is created, add workbook, metadata and document to the space
export const addSpaceInfo = async (
  spaceProps: IReactSimpleOnboarding | any,
  spaceId: string,
  api: FlatfileClient
): Promise<{
  space: Flatfile.SpaceResponse
  workbook: Flatfile.WorkbookResponse | undefined
}> => {
  const {
    workbook,
    sheet,
    environmentId,
    document,
    themeConfig,
    sidebarConfig,
    spaceInfo,
    userInfo,
    spaceBody,
  } = spaceProps
  let localWorkbook

  try {
    if (!workbook && sheet) {
      const createdWorkbook = createWorkbookFromSheet(sheet)
      localWorkbook = await api.workbooks.create({
        spaceId,
        environmentId,
        ...createdWorkbook,
      })

      if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
        throw new Error('Failed to create workbook')
      }
    }
    if (workbook) {
      localWorkbook = await api.workbooks.create({
        spaceId,
        environmentId,
        ...workbook,
      })

      if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
        throw new Error('Failed to create workbook')
      }
    }

    const updatedSpace = await api.spaces.update(spaceId, {
      environmentId,
      metadata: {
        theme: themeConfig,
        sidebarConfig: sidebarConfig ? sidebarConfig : { showSidebar: false },
        userInfo,
        spaceInfo,
        ...(spaceBody?.metadata || {}),
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
    return {
      space: updatedSpace,
      workbook: localWorkbook,
    }
  } catch (error) {
    const message = getErrorMessage(error)
    throw new Error(`Error adding workbook to space: ${message}`)
  }
}
