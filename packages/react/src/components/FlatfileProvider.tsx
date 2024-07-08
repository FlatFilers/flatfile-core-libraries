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

/**
 * @description Providers Flatfile-related context and utilities to its child components:
 * 
 * 1/ Handles opening a portal using `openPortal()` and creating/updating a space
 * when `ready` is true.
 * 2/ Manages the creation, updates, and removal of sheets, workbooks, documents,
 * spaces, and instances.
 * 3/ Triggers `handleCreateSpace`, `handleReUseSpace`, or `resetSpace` on readiness.
 * 
 * @param {Component} .children - components or functionalities that are to be wrapped
 * by the Flatfile provider and can be any JSX elements, function calls, or other
 * React components.
 * 
 * @param {string} .publishableKey - 16-character ID of the portal provider, which
 * is required to authenticate and interact with the Flatfile platform.
 * 
 * @param {string} .accessToken - 3D Flatfile provider's internal access token, which
 * is used to authenticate and authorize API requests made by the component's `Provider`
 * children.
 * 
 * @param {string} .environmentId - Flatfile environment ID, which is used to identify
 * and authenticate with the Flatfile service.
 * 
 * @param {string} .apiUrl - API endpoint of Flatfile provider, which is used to fetch
 * the data and perform operations within the platform.
 * 
 * @param {object} .config - Flatfile provider configuration object that provides
 * various properties and methods to manipulate the Flatfile workspace, sheets, books,
 * and other state related information.
 * 
 * @returns {object} a Flatfile provider context value that contains necessary data
 * for Flatfile's functionality.
 */
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
    document: Flatfile.DocumentConfig | undefined
    workbook: Flatfile.CreateWorkbookConfig
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

  /**
   * @description Automatically configures a space based on input parameters and sets
   * internal access token and session space.
   * 
   * @returns {object} an updated space object containing an access token for internal
   * Flatfile API usage and the previous default page.
   */
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

  /**
   * @description Updates the internal access token and session space based on provided
   * information.
   */
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

  /**
   * @description Updates an existing flatfile workbook by adding a new sheet to its
   * sheets array if it does not already exist in the workbook, or returns the previous
   * space with the updated workbook and sheets array if the sheet already exists.
   * 
   * @param {Flatfile.SheetConfig} newSheet - updated sheet configuration that is being
   * merged into the existing workbook.
   * 
   * @returns {Workbook} an updated version of the previous space, with the newly
   * provided sheet added to the workbook.
   * 
   * 	* `prevSpace`: The existing space in the flat file is updated by setting this
   * property. It contains information about the previous workbook, including its sheets.
   * 	* `workbook`: This property contains information about the entire workbook, which
   * includes all the sheets after the addition of the new sheet. It is an array that
   * holds the previously existing sheets and the newly added sheet.
   * 
   * 	In summary, the `addSheet` function modifies the existing space in the flat file
   * by updating its `prevSpace` property and adding a new sheet to the workbook's
   * `sheets` array.
   */
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

  /**
   * @description Updates a single sheet in a Flatfile workbook based on a given
   * `sheetSlug`. It takes a `Partial<Flatfile.SheetConfig>` update object and returns
   * an updated workbook with the modified sheet.
   * 
   * @param {string} sheetSlug - slug of the sheet for which updates are being made,
   * and is used to filter and merge existing sheets with the updated configurations
   * in the `sheetUpdates` object.
   * 
   * @param {Partial<Flatfile.SheetConfig>} sheetUpdates - updates to be made to an
   * existing sheet with the same slug as the one passed in the `sheetSlug` parameter,
   * by merging the original sheet's properties with the new ones.
   * 
   * @returns {Flatfile.Workbook} a modified `Worksheet` object containing the updates
   * to the specified sheet.
   * 
   * 	* `prevSpace`: The previous space in the flat file is updated by setting this
   * property. It has the shape of `Flatfile.Workspace`, which includes properties like
   * `workbook` and `sheets`.
   * 	* `workbook`: The workbook is an object that contains the shape of `Flatfile.Workbook`.
   * It includes properties like `name`, `version`, `size`, `createdAt`, and `updatedAt`.
   * 	* `sheets`: An array of objects, each representing a sheet in the flat file. Each
   * object has the shape of `Flatfile.SheetConfig` and includes properties like `slug`,
   * `name`, `type`, `rows`, `columns`, `cells`, and `annotations`.
   * 
   * 	In summary, the `updateSheet` function updates the existing sheet in a flat file
   * by taking its slug as input and returning an updated workspace object with the
   * modified sheet information.
   */
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

  /**
   * @description Updates a existing workbook configuration by applying new changes and
   * prioritizing them over existing ones, then returns the updated workbook configuration.
   * 
   * @param {Flatfile.CreateWorkbookConfig} workbookUpdates - updates to be applied to
   * the workbook configuration, including changes to the workbook's sheets and actions.
   */
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

  /**
   * @description Updates an existing document by merging the provided `documentUpdates`
   * with the previous document's state and creating a new one.
   * 
   * @param {Flatfile.DocumentConfig} documentUpdates - updated document configuration
   * for the flat file, which is merged with the existing document configuration in the
   * `setCreateSpace` function to generate the final document update.
   */
  const updateDocument = (documentUpdates: Flatfile.DocumentConfig) => {
    setCreateSpace((prevSpace) => ({
      ...prevSpace,
      document: {
        ...prevSpace.document,
        ...documentUpdates,
      },
    }))
  }

  /**
   * @description Updates an existing space within a Flatfile configuration by combining
   * the previous space configuration with the given `spaceUpdates`. The resulting space
   * configuration is then set as the new value for the `space` property.
   * 
   * @param {Flatfile.SpaceConfig} spaceUpdates - updates to be applied to the existing
   * space configuration.
   */
  const updateSpace = (spaceUpdates: Flatfile.SpaceConfig) => {
    setCreateSpace((prevSpace) => ({
      ...prevSpace,
      space: { ...prevSpace.space, ...spaceUpdates },
    }))
  }

  /**
   * @description Sets `open` to `false`, resets the internal access token and session
   * space, and preloads a Flatfile space if configured to do so.
   * 
   * @param {ClosePortalOptions} .reset - Whether the internal access token and session
   * space should be reset when closing the portal, which is done when set to `true`.
   */
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
      /**
       * @description Determines whether to create a new space or update an existing one
       * based on two input parameters: `publishableKey` and `internalAccessToken`. It calls
       * the appropriate sub-function, `handleCreateSpace()` or `handleReUseSpace()`,
       * depending on the input parameters.
       */
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
