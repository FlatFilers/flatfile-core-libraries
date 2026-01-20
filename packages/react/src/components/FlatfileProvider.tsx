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
import FlatfileContext, {
  DEFAULT_CREATE_SPACE,
  FlatfileContextType,
} from './FlatfileContext'

import { useAttachStyleSheet } from '../utils/attachStyleSheet'
import { workbookOnSubmitAction } from '../utils/constants'

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
  const onClose = useRef<undefined | (() => void)>()
  useAttachStyleSheet(config?.styleSheetOptions)
  const [internalPublishableKey, setInternalPublishableKey] = useState<
    string | undefined | null
  >(publishableKey)
  const [internalAccessToken, setInternalAccessToken] = useState<
    string | undefined | null
  >(accessToken)
  const [listener, setListener] = useState(new FlatfileListener())
  const [open, setOpen] = useState<boolean>(false)
  const [isReusingSpace, setIsReusingSpace] = useState(false)
  const [sessionSpace, setSessionSpace] = useState<
    { space: ISessionSpace } | undefined
  >(undefined)

  const debugLogger = (...args: any[]) => {
    if (config?.debug === true) {
      console.log(...args)
    }
  }

  const [createSpace, setCreateSpace] = useState<{
    document?: Flatfile.DocumentConfig
    workbook?: Flatfile.CreateWorkbookConfig
    space: Flatfile.SpaceConfig & { id?: string }
  }>(DEFAULT_CREATE_SPACE)

  const iframe = useRef<HTMLIFrameElement>(null)

  const [FLATFILE_PROVIDER_CONFIG, setFLATFILE_PROVIDER_CONFIG] = useState({
    ...configDefaults,
    ...config,
  })
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
    if (!internalPublishableKey) {
      return
    }
    // autoConfigure if no workbook or workbook.sheets are provided as they should be handled in the listener space:configure event
    const autoConfigure = !createSpace.workbook?.sheets
    const createSpaceConfig = {
      apiUrl,
      publishableKey: internalPublishableKey,
      space: { ...createSpace.space, autoConfigure },
      workbook: createSpace.workbook,
      document: createSpace.document,
    }
    debugLogger('Created space:', { createSpaceConfig })
    const { data: createdSpace } = await createSpaceInternal(createSpaceConfig)
    debugLogger('Created space:', { createdSpace })
    // A bit of a hack to wire up the Flatfile API key to the window object for internal client side @flatfile/api usage
    ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace.space.accessToken

    if (defaultPage.current) {
      debugLogger('Setting default page:', defaultPage.current)
      await updateDefaultPageInSpace(createdSpace, defaultPage.current)
    }

    setInternalAccessToken(createdSpace.space.accessToken)
    setSessionSpace(createdSpace)
  }

  const handleReUseSpace = async () => {
    setIsReusingSpace(true)
    setFLATFILE_PROVIDER_CONFIG({
      ...FLATFILE_PROVIDER_CONFIG,
      resetOnClose: false,
    })
    if (internalAccessToken && createSpace.space.id) {
      const { data: reUsedSpace } = await getSpace({
        space: { id: createSpace.space.id, accessToken: internalAccessToken },
        apiUrl,
      })
      debugLogger('Found space:', { reUsedSpace })

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

  const removeSheet = (sheetSlug: string) => {
    setCreateSpace((prevSpace) => {
      const sheetToRemove = prevSpace.workbook?.sheets?.find(
        (sheet) => sheet.slug === sheetSlug
      )
      if (!sheetToRemove) {
        return prevSpace
      }
      const currentDefaultPage = defaultPage.current

      if (
        sheetToRemove &&
        sheetToRemove.slug ===
          (typeof currentDefaultPage?.workbook === 'object'
            ? currentDefaultPage.workbook.sheet
            : currentDefaultPage?.workbook)
      ) {
        defaultPage.current = undefined
      }

      const sheetWorkbookAction = workbookOnSubmitAction(sheetToRemove.slug)

      const updatedWorkbookActions = prevSpace.workbook?.actions?.filter(
        (action) => action.operation !== sheetWorkbookAction.operation
      )

      const updatedSheets = prevSpace.workbook?.sheets?.filter(
        (sheet) => sheet.slug !== sheetSlug
      )

      return {
        ...prevSpace,
        workbook: {
          ...prevSpace.workbook,
          name: prevSpace.workbook?.name ?? 'Embedded Workbook',
          sheets: updatedSheets,
          actions: updatedWorkbookActions,
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
          ...(prevSpace.workbook?.sheets?.filter?.(
            (x) =>
              !x.slug ||
              !workbookUpdates.sheets?.find?.((y) => y.slug === x.slug)
          ) || []),
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
    debugLogger('resetting space', { FLATFILE_PROVIDER_CONFIG, providerValue })
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
    onClose.current?.()
  }

  // Listen to the postMessage event from the created iFrame
  useEffect(() => {
    const ff = (message: MessageEvent) =>
      handlePostMessage(FLATFILE_PROVIDER_CONFIG?.closeSpace, listener)(message)
    const debugMessager = (message: MessageEvent) => {
      const { flatfileEvent } = message.data
      if (!flatfileEvent) {
        return
      }
      console.log('Flatfile event ->  ', flatfileEvent.topic, {
        flatfileEvent,
        message,
      })
    }

    window.addEventListener('message', ff, false)
    if (config?.debug) {
      window.addEventListener('message', debugMessager, false)
    }
    return () => {
      window.removeEventListener('message', ff)
      if (config?.debug) {
        window.removeEventListener('message', debugMessager, false)
      }
    }
  }, [listener])

  useEffect(() => {
    if (listener && internalAccessToken) {
      const browserInstance = new Browser({
        apiUrl,
        accessToken: internalAccessToken,
        fetchApi: fetch,
      })
      debugLogger('Mounting listener:', {
        listener,
        apiUrl,
        accessToken: internalAccessToken,
        browserInstance,
      })
      listener.mount(browserInstance)

      // Cleanup function to unmount the listener
      return () => {
        debugLogger('Unmounting listener:', {
          listener,
          browserInstance,
        })
        listener.unmount(browserInstance)
      }
    }
  }, [listener, internalAccessToken, apiUrl])

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
        if (internalPublishableKey && !internalAccessToken) {
          await handleCreateSpace()
        } else if (internalAccessToken && !internalPublishableKey) {
          await handleReUseSpace()
        }
      }
      createOrUpdateSpace()
    }
  }, [ready, open])


  /**
   * Some customer simultaneously support creating new spaces, and re-using existing spaces.
   * When creating a NEW space, the expectation is that the publishableKey is set, but the accessToken is not.
   * (see the useEffect above for selecting between createSpace and handleReUseSpace)
   * 
   * This function allows the consumer to override the publishableKey when needed via the useFlatfile hook.
   * 
   * @param publishableKey 
   */
  const handleOverridePublishableKey = (publishableKey?: string | null) => {
    if (internalAccessToken) {
      setInternalAccessToken(null)
    }
    setInternalPublishableKey(publishableKey)
  }


  /**
   * Some customer simultaneously support creating new spaces, and re-using existing spaces.
   * For re-using an EXISTING space, the expectation is that the accessToken is set, but the publishableKey is not.
   * (see the useEffect above for selecting between createSpace and handleReUseSpace)
   * 
   * This function allows the consumer to override the accessToken when needed via the useFlatfile hook.
   * 
   * @param accessToken 
   */
  const handleOverrideAccessToken = (accessToken?: string | null) => {
    if (internalPublishableKey) {
      setInternalPublishableKey(null)
    }
    setInternalAccessToken(accessToken)
  }

  const providerValue = useMemo(
    (): FlatfileContextType => ({
      ...(internalPublishableKey ? { publishableKey: internalPublishableKey } : {}),
      ...(internalAccessToken ? { accessToken: internalAccessToken } : {}),
      apiUrl,
      environmentId,
      open,
      onClose,
      setOpen,
      sessionSpace,
      setSessionSpace,
      setListener,
      listener,
      setPublishableKey: handleOverridePublishableKey,
      setAccessToken: handleOverrideAccessToken,
      addSheet,
      updateSheet,
      removeSheet,
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
      isReusingSpace,
    }),
    [
      internalPublishableKey,
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
      onClose,
      isReusingSpace,
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
