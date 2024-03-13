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
  console.log('adding info to space: ', spaceId)
  try {
    if (!workbook && sheet) {
      console.log('Creating workbook from sheet', { spaceProps })
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
      console.log('Creating workbook from workbook')
      localWorkbook = await api.workbooks.create({
        spaceId,
        ...(environmentId !== undefined && { environmentId }),
        ...workbook,
      })

      if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
        throw new Error('Failed to create workbook')
      }
    }
    console.log({ localWorkbook })
    await api.spaces.update(spaceId, {
      primaryWorkbookId: localWorkbook?.data.id,
    })
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
