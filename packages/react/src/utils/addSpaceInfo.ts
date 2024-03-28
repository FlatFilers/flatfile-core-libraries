import { Flatfile, FlatfileClient } from '@flatfile/api'
import {
  createWorkbookFromSheets,
  getErrorMessage,
} from '@flatfile/embedded-utils'
import { IReactSimpleOnboarding } from '../types/IReactSimpleOnboarding'

// Given the space is created, add workbook, metadata and document to the space
export const addSpaceInfo = async (
  spaceProps: IReactSimpleOnboarding & { sheets?: Flatfile.SheetConfig[] },
  spaceId: string,
  api: FlatfileClient
): Promise<{
  workbook: Flatfile.WorkbookResponse | undefined
}> => {
  const { workbook, sheet, sheets, environmentId, document, onSubmit } =
    spaceProps
  let localWorkbook
  const combinedSheets = [...(sheet ? [sheet] : []), ...(sheets || [])]
  console.log('addSpaceInfo', {
    workbook: !!workbook,
    combinedSheets: !!combinedSheets,
  })
  try {
    if (!workbook && combinedSheets.length > 0) {
      console.log('!workbook && combinedSheets.length > 0')
      const createdWorkbook = createWorkbookFromSheets(
        combinedSheets,
        !!onSubmit
      )
      localWorkbook = await api.workbooks.create({
        spaceId,
        ...(environmentId !== undefined && { environmentId }),
        ...createdWorkbook,
      })
      if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
        throw new Error('Failed to create workbook')
      }
    }
    if (workbook && !combinedSheets) {
      console.log('workbook && !combinedSheets')
      localWorkbook = await api.workbooks.create({
        spaceId,
        ...(environmentId !== undefined && { environmentId }),
        ...workbook,
      })

      if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
        throw new Error('Failed to create workbook')
      }
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
      workbook: localWorkbook,
    }
  } catch (error) {
    const message = getErrorMessage(error)
    throw new Error(`Error adding workbook to space: ${message}`)
  }
}
