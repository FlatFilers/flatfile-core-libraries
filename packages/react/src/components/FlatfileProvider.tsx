import React, { useEffect, useRef, useState } from 'react'
import FlatfileContext, { DEFAULT_CREATE_SPACE } from './FlatfileContext'
import FlatfileListener, { Browser } from '@flatfile/listener'
import { Flatfile } from '@flatfile/api'
import { EmbeddedIFrameWrapper } from './EmbeddedIFrameWrapper'
import { ExclusiveFlatfileProviderProps } from '../types'
import { handlePostMessage } from '@flatfile/embedded-utils'
import { ClosePortalOptions } from '../types'

export const FlatfileProvider: React.FC<ExclusiveFlatfileProviderProps> = ({
  children,
  publishableKey,
  accessToken,
  environmentId,
  apiUrl = 'https://platform.flatfile.com/api',
  config,
}) => {
  const [internalAccessToken, setAccessToken] = useState<
    string | undefined | null
  >(accessToken)
  const [listener, setListener] = useState(new FlatfileListener())
  const [open, setOpen] = useState<boolean>(false)
  const [sessionSpace, setSessionSpace] = useState<any>(null)

  const [createSpace, setCreateSpace] = useState<{
    document: Flatfile.DocumentConfig | undefined
    workbook: Flatfile.CreateWorkbookConfig
    space: Flatfile.SpaceConfig
  }>(DEFAULT_CREATE_SPACE)

  const [defaultPage, setDefaultPage] = useState<any>(null)
  const iframe = useRef<HTMLIFrameElement | null>(null)

  const addSheet = (newSheet: Flatfile.SheetConfig) => {
    setCreateSpace((prevSpace) => {
      // Check if the sheet already exists
      const sheetExists = prevSpace.workbook.sheets?.some(
        (sheet) => sheet.slug === newSheet.slug
      )
      if (sheetExists) {
        return prevSpace
      }

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
        // Prioritize order of sheets passed along in the Workbook.config then subsequent <Sheet config /> components
        actions: [
          ...(workbookUpdates.actions || []),
          ...(prevSpace.workbook.actions || []),
        ],
        sheets: [
          ...(workbookUpdates.sheets || []),
          ...(prevSpace.workbook.sheets || []),
        ],
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

  const resetSpace = ({ reset }: ClosePortalOptions = {}) => {
    setOpen(false)
    if (reset ?? config?.resetOnClose) {
      setAccessToken(null)
      setSessionSpace(null)

      const spacesUrl = config?.spaceUrl || 'https://platform.flatfile.com/s'
      const preloadUrl = `${spacesUrl}/space-init`

      const spaceLink = sessionSpace?.space?.guestLink || null

      // Works but only after the iframe is visible
      iframe?.current?.setAttribute(
        'src',
        config?.preload ? preloadUrl : spaceLink
      )
    }
  }

  // Listen to the postMessage event from the created iFrame
  useEffect(() => {
    const ff = (message: MessageEvent) =>
      handlePostMessage(config?.closeSpace, listener)(message)

    window.addEventListener('message', ff, false)
    return () => {
      window.removeEventListener('message', ff)
    }
  }, [listener])

  useEffect(() => {
    if (listener && internalAccessToken) {
      const browserInstance = new Browser({
        apiUrl,
        accessToken: internalAccessToken,
        fetchApi: fetch,
      })
      listener.mount(browserInstance)

      // Cleanup function to unmount the listener
      return () => {
        listener.unmount(browserInstance)
      }
    }
  }, [internalAccessToken, apiUrl])

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
        defaultPage,
        setDefaultPage,
        resetSpace,
        config,
      }}
    >
      {children}

      <EmbeddedIFrameWrapper
        handleCloseInstance={resetSpace}
        iRef={iframe}
        {...config}
      />
    </FlatfileContext.Provider>
  )
}
