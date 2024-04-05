import React, { useEffect, useState } from 'react'
import FlatfileContext from './FlatfileContext'
import FlatfileListener, { Browser } from '@flatfile/listener'
import { Flatfile } from '@flatfile/api'
import { EmbeddedIFrameWrapper } from './EmbeddedIFrameWrapper'
import { ExclusiveFlatfileProviderProps } from '../types'

export const FlatfileProvider: React.FC<ExclusiveFlatfileProviderProps> = ({
  children,
  publishableKey,
  accessToken,
  environmentId,
  apiUrl = 'https://platform.flatfile.com/api',
  config,
}) => {
  const [internalAccessToken, setAccessToken] = useState<string | undefined>(
    accessToken
  )
  const [listener, setListener] = useState(new FlatfileListener())
  const [open, setOpen] = useState<boolean>(false)
  const [sessionSpace, setSessionSpace] = useState<any>(null)

  const [createSpace, setCreateSpace] = useState<{
    document: Flatfile.DocumentConfig | undefined
    workbook: Flatfile.CreateWorkbookConfig
    space: Flatfile.SpaceConfig
  }>({
    document: undefined,
    workbook: {
      name: 'Embedded Workbook',
      sheets: [],
    },
    space: {
      name: 'Embedded Space',
      labels: ['embedded'],
      namespace: 'portal',
      metadata: {
        sidebarConfig: { showSidebar: false },
      },
    },
  })

  const addSheet = (newSheet: Flatfile.SheetConfig) => {
    setCreateSpace((prevSpace) => {
      // Check if the sheet already exists
      const sheetExists = prevSpace.workbook.sheets?.some(
        (sheet: any) => sheet.slug === newSheet.slug
      )
      if (sheetExists) {
        return prevSpace // Return the state unchanged if the sheet exists
      }
      // Add the new sheet if it doesn't exist
      return {
        ...prevSpace,
        workbook: {
          ...prevSpace.workbook,
          sheets: [...(prevSpace.workbook.sheets || []), newSheet],
        },
      }
    })
  }

  const updateSheet = (
    sheetSlug: string,
    sheetUpdates: Partial<Flatfile.SheetConfig>
  ) => {
    setCreateSpace((prevSpace) => {
      const updatedSheets = prevSpace.workbook.sheets?.map((sheet: any) => {
        if (sheet.slug === sheetSlug) {
          return { ...sheet, ...sheetUpdates }
        }
        return sheet
      })

      return {
        ...prevSpace,
        workbook: {
          ...prevSpace.workbook,
          sheets: updatedSheets,
        },
      }
    })
  }

  const updateWorkbook = (workbookUpdates: Flatfile.CreateWorkbookConfig) => {
    setCreateSpace((prevSpace) => ({
      ...prevSpace,
      workbook: {
        ...prevSpace.workbook,
        ...workbookUpdates,
      },
    }))
  }

  const updateDocument = (documentUpdates: Flatfile.DocumentConfig) => {
    setCreateSpace((prevSpace) => ({
      ...prevSpace,
      document: {
        ...prevSpace.document,
        ...documentUpdates,
      },
    }))
  }

  const updateSpace = (spaceUpdates: Flatfile.SpaceConfig) => {
    setCreateSpace((prevSpace) => ({
      ...prevSpace,
      space: { ...prevSpace.space, ...spaceUpdates },
    }))
  }

  const handlePostMessage = (message: {
    data: { flatfileEvent: Record<string, any> }
  }) => {
    const { flatfileEvent } = message.data
    if (!flatfileEvent) return

    listener.dispatchEvent(flatfileEvent)
  }

  useEffect(() => {
    window.addEventListener('message', handlePostMessage, false)
    return () => {
      window.removeEventListener('message', handlePostMessage)
    }
  }, [listener])

  useEffect(() => {
    if (listener && internalAccessToken) {
      listener.mount(
        new Browser({
          apiUrl,
          accessToken: internalAccessToken,
          fetchApi: fetch,
        })
      )
    }
  }, [listener, internalAccessToken, apiUrl])

  return (
    <FlatfileContext.Provider
      value={{
        ...(publishableKey ? { publishableKey } : {}),
        ...(internalAccessToken ? { accessToken: internalAccessToken } : {}),
        apiUrl,
        environmentId,
        open,
        setOpen,
        sessionSpace,
        setSessionSpace,
        setListener,
        listener,
        setAccessToken,
        addSheet,
        updateSheet,
        updateWorkbook,
        updateDocument,
        createSpace,
        setCreateSpace,
        updateSpace,
      }}
    >
      {children}

      <EmbeddedIFrameWrapper
        handleCloseInstance={() => setOpen(false)}
        {...config}
      />
    </FlatfileContext.Provider>
  )
}
