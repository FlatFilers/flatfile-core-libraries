import { useContext } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { getSpace } from '../utils/getSpace'
import { createSpaceInternal } from '../utils/createSpaceInternal'
import { FlatfileClient } from '@flatfile/api'
import { ClosePortalOptions } from '../types'
import { convertDatesToISO } from '../utils/convertDatesToISO'

const findDefaultPage = (createdSpace: any, defaultPage: any) => {
  if (!defaultPage) return
  if (defaultPage.document) {
    const document = createdSpace.documents.find(
      (d: any) => d.title === defaultPage.document
    )
    return {
      documentId: document.id,
    }
  }
  if (defaultPage.workbook) {
    if (defaultPage.workbook.sheet) {
      const sheet = createdSpace.workbooks[0].sheets.find(
        (s: any) => s.slug === defaultPage.workbook.sheet
      )
      return {
        workbook: {
          workbookId: createdSpace.workbooks[0].id,
          sheetId: sheet.id,
        },
      }
    }
    return {
      workbook: {
        workbookId: createdSpace.workbooks[0].id,
      },
    }
  }
  return undefined
}

export const useFlatfile: () => {
  openPortal: () => void
  closePortal: (options?: ClosePortalOptions) => void
  open: boolean
  setListener: (listener: any) => void
  listener: any
} = () => {
  const context = useContext(FlatfileContext)

  if (!context) {
    throw new Error('useFlatfile must be used within a FlatfileProvider')
  }

  const {
    open,
    setOpen,
    setListener,
    listener,
    publishableKey,
    apiUrl,
    setSessionSpace,
    accessToken,
    setAccessToken,
    createSpace,
    defaultPage,
    resetSpace,
  } = context

  const handleCreateSpace = async () => {
    if (!publishableKey) {
      return
    }
    // autoConfigure if no workbook or workbook.sheets are provided as they should be handled in the listener space:configure event
    const autoConfigure = !(createSpace.workbook && createSpace.workbook.sheets)
    const { data: createdSpace } = await createSpaceInternal({
      apiUrl,
      publishableKey,
      space: { ...createSpace.space, autoConfigure },
      workbook: createSpace.workbook,
      document: createSpace.document,
    })
    // A bit of a hack to wire up the Flatfile API key to the window object for internal client side @flatfile/api usage
    ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace.space.accessToken

    const defaultPageDetails = findDefaultPage(createdSpace, defaultPage)
    if (defaultPageDetails) {
      const api = new FlatfileClient()
      const updatedSpace = await api.spaces.update(createdSpace.space.id, {
        metadata: {
          ...createdSpace.space.metadata,
          sidebarConfig: {
            ...createdSpace.space.metadata.sidebarConfig,
            defaultPage: defaultPageDetails,
          },
        },
      })

      createdSpace.space.metadata.sidebarConfig = {
        ...createdSpace.space.metadata.sidebarConfig,
        defaultPage: updatedSpace.data.metadata.sidebarConfig.defaultPage,
      }
    }

    setAccessToken(createdSpace.space.accessToken)
    setSessionSpace(createdSpace)
  }

  const handleReUseSpace = async () => {
    if (accessToken && 'id' in createSpace.space) {
      createSpace.space.accessToken = accessToken
      const { data: reUsedSpace } = await getSpace({
        space: createSpace.space,
        apiUrl,
      })

      if (reUsedSpace.accessToken) {
        ;(window as any).CROSSENV_FLATFILE_API_KEY = reUsedSpace.accessToken
        setAccessToken(reUsedSpace.accessToken)
      }

      setSessionSpace({ space: convertDatesToISO(reUsedSpace) })
    }
  }

  const openPortal = () => {
    ;(window as any).CROSSENV_FLATFILE_API_URL = apiUrl
    if (publishableKey && !accessToken) {
      handleCreateSpace()
    } else if (accessToken && !publishableKey) {
      handleReUseSpace()
    }
    setOpen(true)
  }

  const closePortal = (options?: ClosePortalOptions) => {
    resetSpace(options)
  }


  return {
    openPortal,
    closePortal,
    open,
    setListener,
    listener,
  }
}
