import React, { useCallback, useEffect, useRef, useState } from 'react'
import FlatfileContext, { DEFAULT_CREATE_SPACE } from './FlatfileContext'
import FlatfileListener, { Browser } from '@flatfile/listener'
import { Flatfile } from '@flatfile/api'
import { EmbeddedIFrameWrapper } from './EmbeddedIFrameWrapper'
import { ExclusiveFlatfileProviderProps, IFrameTypes } from '../types'
import { handlePostMessage } from '@flatfile/embedded-utils'
import { ClosePortalOptions } from '../types'

const configDefaults: IFrameTypes = {
  preload: true,
  resetOnClose: true,
}

interface SESSION_SPACE
  extends Omit<Flatfile.Space, 'createdAt' | 'updatedAt' | 'upgradedAt'> {
  createdAt: string
  updatedAt: string
  upgradedAt: string
}

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
  const [sessionSpace, setSessionSpace] = useState<
    { space: SESSION_SPACE } | undefined
  >(undefined)

  const [createSpace, setCreateSpace] = useState<{
    document: Flatfile.DocumentConfig | undefined
    workbook: Flatfile.CreateWorkbookConfig
    space: Flatfile.SpaceConfig
  }>(DEFAULT_CREATE_SPACE)

  const [defaultPage, setDefaultPageRaw] = useState<any>(undefined)

  const setDefaultPage = useCallback(
    (incomingDefaultPage: any) => {
      if (defaultPage === undefined) {
        setDefaultPageRaw(incomingDefaultPage)
      } else {
        console.warn(
          `Attempt to set multiple default pages detected. Only one default page can be set per space. Current default page: ${JSON.stringify(
            defaultPage
          )}, Attempted new default page: ${JSON.stringify(
            incomingDefaultPage
          )}`
        )
      }
    },
    [defaultPage]
  )

  const iframe = useRef<HTMLIFrameElement | null>(null)

  const FLATFILE_PROVIDER_CONFIG = { ...config, ...configDefaults }

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

    if (reset ?? FLATFILE_PROVIDER_CONFIG.resetOnClose) {
      setAccessToken(null)
      setSessionSpace(undefined)

      const spacesUrl =
        FLATFILE_PROVIDER_CONFIG.spaceUrl || 'https://platform.flatfile.com/s'
      const preloadUrl = `${spacesUrl}/space-init`

      const spaceLink = sessionSpace?.space?.guestLink || null
      const iFrameSrc = FLATFILE_PROVIDER_CONFIG.preload
        ? preloadUrl
        : spaceLink
      if (iFrameSrc) {
        iframe?.current?.setAttribute('src', iFrameSrc)
      }
      // Works but only after the iframe is visible
    }
  }

  // Listen to the postMessage event from the created iFrame
  useEffect(() => {
    const ff = (message: MessageEvent) =>
      handlePostMessage(FLATFILE_PROVIDER_CONFIG?.closeSpace, listener)(message)

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
        config: FLATFILE_PROVIDER_CONFIG,
      }}
    >
      {children}

      <EmbeddedIFrameWrapper
        handleCloseInstance={resetSpace}
        iRef={iframe}
        {...FLATFILE_PROVIDER_CONFIG}
      />
    </FlatfileContext.Provider>
  )
}
