import { Flatfile, FlatfileClient } from '@flatfile/api'
import {
  createWorkbookFromSheet,
  getErrorMessage,
} from '@flatfile/embedded-utils'
import { IReactSimpleOnboarding } from '../types/IReactSimpleOnboarding'

// Given the space is created, add workbook, metadata and document to the space
export const addSpaceInfo = async (
  spaceProps: IReactSimpleOnboarding,
  spaceId: string,
  api: FlatfileClient
): Promise<{
  workbook: Flatfile.WorkbookResponse | undefined
}> => {
  const { workbook, sheet, environmentId, document, onSubmit } = spaceProps
  let localWorkbook
  try {
    if (!workbook && sheet) {
      const createdWorkbook = createWorkbookFromSheet(sheet, !!onSubmit)
      localWorkbook = await api.workbooks.create({
        spaceId,
        ...(environmentId !== undefined && { environmentId }),
        ...createdWorkbook,
      })
      if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
        throw new Error('Failed to create workbook')
      }
    }
    if (workbook && !sheet) {
      localWorkbook = await api.workbooks.create({
        spaceId,
        ...(environmentId !== undefined && { environmentId }),
        ...workbook,
      })

      if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
        throw new Error('Failed to create workbook')
      }
    }
    // await api.spaces.update(spaceId, {
    //   primaryWorkbookId: localWorkbook?.data.id,
    // })
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
      workbook: localWorkbook,
    }
  } catch (error) {
    const message = getErrorMessage(error)
    throw new Error(`Error adding workbook to space: ${message}`)
  }
}
