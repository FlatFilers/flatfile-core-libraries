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
 * @description Sets up Flatfile Provider for a Portal, handling authentication, sheet
 * management, and space creation/updates. It provisions an iframe to load the Portal
 * content and listens for postMessages from the created iFrame to handle space updates
 * and closing.
 * 
 * @param {React Element or JSX Expression} .children - children of the FlatfileProvider
 * component, which are the components that will be rendered inside the iFrame.
 * 
 * 	1/ `children`: The input passed to the `<FlatfileContext.Provider>` component is
 * an array of React components.
 * 	2/ `FLATFILE_PROVIDER_CONFIG`: An object that contains various configuration
 * options for Flatfile, such as the space URL, API URL, and environment ID. This
 * object is used to update the space and documents inside the space.
 * 	3/ `handleCreateSpace`: A function that creates a new space when called. It takes
 * no arguments.
 * 	4/ `handleReUseSpace`: A function that updates an existing space when called. It
 * takes no arguments.
 * 	5/ `publishableKey`: An optional string that contains the publishable key for the
 * Flatfile instance. If not provided, it will be fetched from the Flatfile server.
 * 	6/ `internalAccessToken`: An optional string that contains the internal access
 * token for the Flatfile instance. If not provided, it will be fetched from the
 * Flatfile server.
 * 	7/ `apiUrl`: The API URL for the Flatfile instance. This is used to make requests
 * to the Flatfile server.
 * 	8/ `environmentId`: An optional string that contains the environment ID for the
 * Flatfile instance. If not provided, it will be fetched from the Flatfile server.
 * 	9/ `open`: An optional boolean value that indicates whether the space is open or
 * closed. This is used to control the visibility of the space.
 * 	10/ `setOpen`: A function that sets the open status of the space. It takes a
 * boolean argument indicating whether the space should be open or closed.
 * 	11/ `sessionSpace`: An optional object that contains information about the current
 * session space, including the ID and URL. If not provided, it will be fetched from
 * the Flatfile server.
 * 	12/ `setSessionSpace`: A function that sets the session space information. It
 * takes an object with `ID` and `URL` properties as arguments.
 * 	13/ `setListener`: A function that sets the listener function for updates to the
 * space and documents. It takes a function as an argument.
 * 	14/ `listener`: An optional function that is called whenever there are updates
 * to the space or documents. If not provided, it will be fetched from the Flatfile
 * server.
 * 	15/ `defaultPage`: An optional React component that contains the default page for
 * the Flatfile instance. If not provided, it will be fetched from the Flatfile server.
 * 	16/ `setDefaultPage`: A function that sets the default page for the Flatfile
 * instance. It takes a React component as an argument.
 * 
 * @param {string} .publishableKey - 10-digit publishable key associated with the
 * Space, which is required to authenticate and interact with the Flatfile platform.
 * 
 * @param {string} .accessToken - Flatfile access token used to authenticate and make
 * API requests within the provider component.
 * 
 * @param {string} .environmentId - environment ID that Flatfile should be deployed
 * to. It is used to pass the necessary configuration to the Flatfile provider component
 * to properly authenticate and interact with the Flatfile API.
 * 
 * @param {string} .apiUrl - 3D visualization API endpoint used for fetching and
 * updating the virtual 3D environment.
 * 
 * @param {object} .config - Flatfile Provider configuration object, which is used
 * to determine the behavior of the `FlatfileContext.Provider` component. It specifies
 * various settings and options for the provider, such as the API URL, authentication
 * token, and whether to create a new space or reuse an existing one.
 * 
 * @returns {object} a Flatfile provider that renders a space and allows for the
 * creation, updating, and deleting of sheets, workbooks, and documents.
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
   * @description Automatically configure's Flatfile space using API key when provided
   * with publishable key, otherwise it handles internal client side API usage and
   * updates default page in Flatfile space.
   * 
   * @returns {AccessToken} an access token for the newly created space, which is stored
   * in the `window` object and used for internal client-side Flatfile API usage.
   * 
   * 	* `createdSpace`: an object containing the newly created space, including its ID,
   * name, and auto-configure status.
   * 	* `apiUrl`: the URL of the Flatfile API server.
   * 	* `publishableKey`: the publishable key for the Flatfile API.
   * 	* `workbook`: the workbook associated with the createSpace call, or undefined if
   * none was provided.
   * 	* `document`: the document associated with the createSpace call, or undefined if
   * none was provided.
   * 	* `sessionSpace`: an object containing the current session space, including its
   * ID and access token.
   * 	* `internalAccessToken`: the internal access token for the current session space.
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
   * @description Verifies if an access token exists for a given space, and if so, sets
   * it as the internal access token and saves it to the session space object.
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
   * @description Updates a pre-existing Flutter file by adding a new sheet to the
   * workbook if one does not already exist with the same slug as the new sheet.
   * 
   * @param {Flatfile.SheetConfig} newSheet - Flatfile.SheetConfig object containing
   * the configuration details of a new sheet to be created within an existing workbook.
   * 
   * @returns {updated instance of `Flatfile.WorkbookConfig} a modified version of the
   * `prevSpace` object, where a new sheet has been added to the workbook.
   * 
   * 	* `prevSpace`: The previous workbook state.
   * 	* `workbook`: The updated workbook state, which includes the new sheet added to
   * the previous one. It is an object with the following properties:
   * 		+ `sheets`: An array of sheets, which now contains the newly added sheet as well
   * as the existing ones.
   * 		+ `slug`: The unique identifier for each sheet, used for reference in the workbook.
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
   * @description Updates a specific sheet in a Flatfile workbook based on a given slug
   * and partial updates. It mutates the workbook's sheets object by mapping over it
   * and replacing the specified sheet with the updated one.
   * 
   * @param {string} sheetSlug - unique identifier of the sheet for which the updates
   * are being applied.
   * 
   * @param {Partial<Flatfile.SheetConfig>} sheetUpdates - updates that should be applied
   * to the sheet with the matching slug, which is provided as the `sheetSlug` input parameter.
   * 
   * @returns {object} an updated `Flatfile.Workspace` object with a modified sheet.
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
   * @description Modifies a previously created workbook configuration based on new
   * inputs provided by the `workbookUpdates` object. It prioritizes the sheets and
   * actions passed in the updates, merging them with any existing sheets and actions
   * in the previous workbook configuration.
   * 
   * @param {Flatfile.CreateWorkbookConfig} workbookUpdates - updates to be applied to
   * the workbook, including changes to the worksheet configuration, actions, and sheets.
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
   * @description Updates a `Flatfile.DocumentConfig` object's `document` property by
   * concatenating the original document and any update documents provided in the
   * `documentUpdates` object.
   * 
   * @param {Flatfile.DocumentConfig} documentUpdates - updates to be applied to the
   * `document` field of the `Flatfile.DocumentConfig` object, which are then merged
   * with the previous document configuration to produce the updated document configuration.
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
   * @description Updates a space configuration by combining the current space configuration
   * with new space updates. The updated space configuration is then assigned to the
   * `space` object within the context.
   * 
   * @param {Flatfile.SpaceConfig} spaceUpdates - updates to be applied to the space configuration.
   */
  const updateSpace = (spaceUpdates: Flatfile.SpaceConfig) => {
    setCreateSpace((prevSpace) => ({
      ...prevSpace,
      space: { ...prevSpace.space, ...spaceUpdates },
    }))
  }

  /**
   * @description Sets open to false, resets internal access token and session space,
   * preloads a space URL, and updates an iframe's source tag based on configuration options.
   * 
   * @param {ClosePortalOptions} .reset - FlatFile Provider configuration's `resetOnClose`
   * property, which when set to `true`, triggers the reset of internal access token
   * and space URL after the portal is closed.
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
       * based on two inputs: `publishableKey` and `internalAccessToken`. It executes the
       * appropriate action based on the input values.
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
