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
  const setDefaultPage = (incomingDefaultPage: any) => {
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
    if (workbook) {
      const localWorkbook = await api.workbooks.create({
        spaceId,
        ...(environmentId !== undefined && { environmentId }),
        ...workbook,
      })

      console.log({ localWorkbook })

      if (workbook.defaultPage) {
        setDefaultPage({
          workbook: {
            workbookId: localWorkbook.data.id,
          },
        })
      } else if (workbook.sheets) {
        const defaultSheet = workbook.sheets.find((sheet) => sheet.defaultPage)
        if (defaultSheet && defaultSheet.slug) {
          setDefaultPage({ workbook: { sheet: defaultSheet.slug } })
        }
      }

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
      if (document.defaultPage) {
        setDefaultPage({ documentId: createdDocument.data.id })
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
