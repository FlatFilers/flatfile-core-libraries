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
  let defaultPage
  let defaultPageSet = false
  const setDefaultPage = (
    incomingDefaultPage:
      | { workbook: { workbookId: string; sheetId?: string } }
      | { documentId: string }
  ) => {
    if (defaultPageSet === true) {
      console.warn(
        'Default page is already set. Multiple default pages are not allowed.'
      )
    } else {
      defaultPage = incomingDefaultPage
      defaultPageSet = true
    }
  }

  try {
    if (document) {
      const createdDocument = await api.documents.create(spaceId, {
        title: document.title,
        body: document.body,
      })

      if (document.defaultPage) {
        setDefaultPage({ documentId: createdDocument.data.id })
      }
    }

    if (workbook) {
      const localWorkbook = await api.workbooks.create({
        spaceId,
        ...(environmentId !== undefined && { environmentId }),
        ...workbook,
      })

      if (workbook.defaultPage) {
        setDefaultPage({
          workbook: {
            workbookId: localWorkbook.data.id,
          },
        })
      } else if (workbook.sheets) {
        const defaultSheet = workbook.sheets.find((sheet) => sheet.defaultPage)
        if (defaultSheet && defaultSheet.slug) {
          const foundSheet = localWorkbook.data.sheets?.find(
            (sheet) => sheet.slug === defaultSheet.slug
          )
          if (defaultSheet && defaultSheet.slug && foundSheet) {
            setDefaultPage({
              workbook: {
                workbookId: localWorkbook.data.id,
                sheetId: foundSheet.id,
              },
            })
          }
        }
      }
    }
    const updatedSpace = await api.spaces.update(spaceId, {
      ...(environmentId !== undefined && { environmentId }),
      metadata: {
        theme: themeConfig,
        sidebarConfig: {
          ...sidebarConfig,
          showSidebar: sidebarConfig?.showSidebar ?? false,
          ...(defaultPage ? { defaultPage } : {}),
        },
        userInfo,
        spaceInfo,
      },
    })
    if (!updatedSpace) {
      throw new Error('Failed to update space')
    }
  } catch (error) {
    const message = getErrorMessage(error)
    throw new Error(`Error adding workbook to space: ${message}`)
  }
}

export default addSpaceInfo
