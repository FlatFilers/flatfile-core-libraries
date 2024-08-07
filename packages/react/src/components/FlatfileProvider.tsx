import { Flatfile } from '@flatfile/api'

import {
  DefaultPageType,
  handlePostMessage,
  updateDefaultPageInSpace,
} from '@flatfile/embedded-utils'
import FlatfileListener, { Browser } from '@flatfile/listener'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ClosePortalOptions,
  ExclusiveFlatfileProviderProps,
  IFrameTypes,
} from '../types'

import { convertDatesToISO } from '../utils/convertDatesToISO'
import { createSpaceInternal } from '../utils/createSpaceInternal'
import { getSpace } from '../utils/getSpace'
import { EmbeddedIFrameWrapper } from './EmbeddedIFrameWrapper'
import FlatfileContext, { DEFAULT_CREATE_SPACE } from './FlatfileContext'

import { attachStyleSheet } from '../utils/attachStyleSheet'

const configDefaults: IFrameTypes = {
  preload: true,
  resetOnClose: true,
}

interface ISessionSpace
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
  const [internalAccessToken, setInternalAccessToken] = useState<
    string | undefined | null
  >(accessToken)
  const [listener, setListener] = useState(new FlatfileListener())
  const [open, setOpen] = useState<boolean>(false)
  const [sessionSpace, setSessionSpace] = useState<
    { space: ISessionSpace } | undefined
  >(undefined)

  const [createSpace, setCreateSpace] = useState<{
    document?: Flatfile.DocumentConfig
    workbook?: Flatfile.CreateWorkbookConfig
    space: Flatfile.SpaceConfig & { id?: string }
  }>(DEFAULT_CREATE_SPACE)

  const iframe = useRef<HTMLIFrameElement>(null)

  const FLATFILE_PROVIDER_CONFIG = { ...config, ...configDefaults }

  const defaultPage = useRef<DefaultPageType | undefined>(undefined)

  const setDefaultPage = useCallback((incomingDefaultPage: DefaultPageType) => {
    if (!defaultPage.current) {
      defaultPage.current = incomingDefaultPage
    } else {
      console.warn(
        `Attempt to set multiple default pages detected. Only one default page can be set per space. Current default page: ${JSON.stringify(
          defaultPage.current
        )}, Attempted new default page: ${JSON.stringify(incomingDefaultPage)}`
      )
    }
  }, [])
  const [ready, setReady] = useState<boolean>(false)

  const handleCreateSpace = async () => {
    if (!publishableKey) {
      return
    }
    // autoConfigure if no workbook or workbook.sheets are provided as they should be handled in the listener space:configure event
    const autoConfigure = !createSpace.workbook?.sheets
    const { data: createdSpace } = await createSpaceInternal({
      apiUrl,
      publishableKey,
      space: { ...createSpace.space, autoConfigure },
      workbook: createSpace.workbook,
      document: createSpace.document,
    })

    // A bit of a hack to wire up the Flatfile API key to the window object for internal client side @flatfile/api usage
    ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace.space.accessToken

    if (defaultPage.current) {
      await updateDefaultPageInSpace(createdSpace, defaultPage.current)
    }

    setInternalAccessToken(createdSpace.space.accessToken)
    setSessionSpace(createdSpace)
  }

  const handleReUseSpace = async () => {
    if (internalAccessToken && createSpace.space.id) {
      const { data: reUsedSpace } = await getSpace({
        space: { id: createSpace.space.id, accessToken: internalAccessToken },
        apiUrl,
      })

      if (reUsedSpace.accessToken) {
        ;(window as any).CROSSENV_FLATFILE_API_KEY = reUsedSpace.accessToken
        setInternalAccessToken(reUsedSpace.accessToken)
      }

      setSessionSpace({ space: convertDatesToISO(reUsedSpace) })
    }
  }

  const addSheet = (newSheet: Flatfile.SheetConfig) => {
    setCreateSpace((prevSpace) => {
      // Check if the sheet already exists
      const sheetExists = prevSpace.workbook?.sheets?.some(
        (sheet) => sheet.slug === newSheet.slug
      )
      if (sheetExists) {
        return prevSpace
      }

      return {
        ...prevSpace,
        workbook: {
          ...prevSpace.workbook,
          name: prevSpace.workbook?.name ?? 'Embedded Workbook',
          sheets: [...(prevSpace.workbook?.sheets || []), newSheet],
        },
      }
    })
  }

  const updateSheet = (
    sheetSlug: string,
    sheetUpdates: Partial<Flatfile.SheetConfig>
  ) => {
    setCreateSpace((prevSpace) => {
      const updatedSheets = prevSpace.workbook?.sheets?.map((sheet: any) => {
        if (sheet.slug === sheetSlug) {
          return { ...sheet, ...sheetUpdates }
        }
        return sheet
      })

      return {
        ...prevSpace,
        workbook: {
          ...prevSpace.workbook,
          name: prevSpace.workbook?.name ?? 'Embedded Workbook',
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
          ...(prevSpace.workbook?.actions || []),
        ],
        sheets: [
          ...(workbookUpdates.sheets || []),
          ...(prevSpace.workbook?.sheets || []),
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
      setInternalAccessToken(null)
      setSessionSpace(undefined)

      const spacesUrl =
        FLATFILE_PROVIDER_CONFIG.spaceUrl ?? 'https://platform.flatfile.com/s'
      const preloadUrl = `${spacesUrl}/space-init`

      const spaceLink = sessionSpace?.space?.guestLink ?? null
      const iFrameSrc = FLATFILE_PROVIDER_CONFIG.preload
        ? preloadUrl
        : spaceLink

      if (iFrameSrc) {
        iframe.current?.setAttribute('src', iFrameSrc)
      }
      // Works but only after the iframe is visible
    }
  }
  const styleSheetRef = useRef(false)

  useEffect(() => {
    if (!styleSheetRef.current) {
      attachStyleSheet(config?.styleSheetOptions)
      styleSheetRef.current = true
    }
  }, [config?.styleSheetOptions, styleSheetRef])

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

  // Sets a ready variable if the createSpace context has been updated.
  useEffect(() => {
    if (!ready) {
      const isDefaultCreateSpace =
        JSON.stringify(createSpace) === JSON.stringify(DEFAULT_CREATE_SPACE)
      if (!isDefaultCreateSpace) {
        setReady(true)
      }
    }
  }, [createSpace])

  // Triggers handleCreateSpace or handleReUseSpace when the openPortal() is clicked and ready is true
  useEffect(() => {
    if (ready && open) {
      const createOrUpdateSpace = async () => {
        if (publishableKey && !internalAccessToken) {
          await handleCreateSpace()
        } else if (internalAccessToken && !publishableKey) {
          await handleReUseSpace()
        }
      }
      createOrUpdateSpace()
    }
  }, [ready, open])

  const providerValue = useMemo(
    () => ({
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
      setAccessToken: setInternalAccessToken,
      addSheet,
      updateSheet,
      updateWorkbook,
      updateDocument,
      createSpace,
      setCreateSpace,
      updateSpace,
      defaultPage: defaultPage.current,
      setDefaultPage,
      resetSpace,
      config: FLATFILE_PROVIDER_CONFIG,
      ready,
      iframe,
    }),
    [
      publishableKey,
      internalAccessToken,
      apiUrl,
      environmentId,
      open,
      sessionSpace,
      listener,
      createSpace,
      defaultPage,
      ready,
      iframe,
      FLATFILE_PROVIDER_CONFIG,
    ]
  )

  return (
    <FlatfileContext.Provider value={providerValue}>
      {children}
      <EmbeddedIFrameWrapper
        handleCloseInstance={resetSpace}
        {...FLATFILE_PROVIDER_CONFIG}
      />
    </FlatfileContext.Provider>
  )
}
