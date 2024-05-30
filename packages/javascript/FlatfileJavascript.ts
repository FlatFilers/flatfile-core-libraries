import { Flatfile, FlatfileClient } from '@flatfile/api'
import {
  DefaultPageType,
  DefaultSubmitSettings,
  ISpace,
  JobHandler,
  NewSpaceFromPublishableKey,
  SheetHandler,
  SimpleOnboarding,
  createWorkbookFromSheet,
  findDefaultPage,
  handlePostMessage,
  updateDefaultPageInSpace,
} from '@flatfile/embedded-utils'
import { FlatfileRecord } from '@flatfile/hooks'
import { Browser, FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { createIframe } from './src/createIframe'
import { createModal } from './src/createModal'

const displayError = (errorTitle: string, errorMessage: string) => {
  const display = document.createElement('div')
  display.classList.add('ff_error_container')
  const title = document.createElement('h1')
  title.classList.add('ff_error_heading')
  const error = document.createElement('p')
  error.classList.add('ff_error_text')

  title.innerText = errorTitle
  error.innerText = errorMessage

  display.appendChild(title)
  display.appendChild(error)

  return display
}

async function createlistener(
  accessToken: string,
  apiUrl: string,
  listener: FlatfileListener,
  closeSpace: NewSpaceFromPublishableKey['closeSpace']
): Promise<() => void> {
  const browser_instance = new Browser({
    apiUrl,
    accessToken,
    fetchApi: fetch,
  })
  const ff_message_handler = handlePostMessage(closeSpace, listener)

  listener.mount(browser_instance)
  window.addEventListener('message', ff_message_handler, false)

  return () => {
    window.removeEventListener('message', ff_message_handler)
    listener.unmount(browser_instance)
  }
}
interface SimpleListenerType
  extends Pick<
    SimpleOnboarding,
    'onRecordHook' | 'onSubmit' | 'submitSettings'
  > {
  slug: string
}

const createSimpleListener = ({
  onRecordHook,
  onSubmit,
  slug,
  submitSettings,
}: SimpleListenerType) =>
  FlatfileListener.create((client: FlatfileListener) => {
    const api = new FlatfileClient()
    if (onRecordHook) {
      client.use(
        recordHook(
          slug,
          async (record: FlatfileRecord, event: FlatfileEvent | undefined) =>
            onRecordHook(record, event)
        )
      )
    }
    if (onSubmit) {
      const onSubmitSettings = { ...DefaultSubmitSettings, ...submitSettings }
      client.filter({ job: 'workbook:simpleSubmitAction' }, (configure) => {
        configure.on('job:ready', async (event) => {
          const { jobId, spaceId, workbookId } = event.context
          try {
            await api.jobs.ack(jobId, { info: 'Starting job', progress: 10 })

            const job = new JobHandler(jobId)
            const { data: workbookSheets } = await api.sheets.list({
              workbookId,
            })

            // this assumes we are only allowing 1 sheet here (which we've talked about doing initially)
            const sheet = new SheetHandler(workbookSheets[0].id)

            await onSubmit({ job, sheet, event })

            await api.jobs.complete(jobId, {
              outcome: {
                message: 'complete',
              },
            })
            if (onSubmitSettings.deleteSpaceAfterSubmit) {
              await api.spaces.archiveSpace(spaceId)
            }
          } catch (error: any) {
            if (jobId) {
              await api.jobs.cancel(jobId)
            }
            console.error('Error:', error.stack)
          }
        })
      })
    }
  })

/**
 * Utility function with the responsibility of mounting the confirmation modal and its
 * associate behaviors to the iFrame which is actively being mounted (or was previously preloaded)
 * @param domElement
 * @param displayAsModal
 * @param exitTitle
 * @param exitText
 * @param exitPrimaryButtonText
 * @param exitSecondaryButtonText
 * @param closeSpace
 * @param removeMessageListener
 * @param onCancel
 */
function initializeIFrameConfirmationModal(
  domElement: HTMLElement,
  displayAsModal: boolean,
  exitTitle: string,
  exitText: string,
  exitPrimaryButtonText: string,
  exitSecondaryButtonText: string,
  closeSpace?: ISpace['closeSpace'],
  removeMessageListener?: () => void,
  onCancel?: () => void
) {
  // Create the confirmation modal and hide it
  const confirmModal = createModal(
    () => {
      // If user chooses to exit
      const wrappers = Array.from(
        document.getElementsByClassName('flatfile_iframe-wrapper')
      ) as HTMLElement[]
      const modals = Array.from(
        document.getElementsByClassName('flatfile_outer-shell')
      ) as HTMLElement[]

      const elements = [...modals]

      for (let item of elements) {
        document.body.removeChild(item)
      }

      domElement.remove()
      if (onCancel) {
        onCancel()
      }
      if (removeMessageListener) removeMessageListener()
      if (closeSpace && typeof closeSpace.onClose === 'function')
        closeSpace.onClose({})
    },
    () => {
      // If user chooses to stay, we simply hide the confirm modal
      confirmModal.style.display = 'none'
    },
    exitTitle, // pass exitTitle here
    exitText, // pass exitText here,
    exitPrimaryButtonText,
    exitSecondaryButtonText
  )
  confirmModal.style.display = 'none'
  document.body.appendChild(confirmModal)

  window.addEventListener(
    'message',
    (event) => {
      if (
        event.data &&
        event.data.topic === 'job:outcome-acknowledged' &&
        event.data.payload.status === 'complete' &&
        event.data.payload.operation === closeSpace?.operation
      ) {
        domElement.remove()
      }
    },
    false
  )

  if (displayAsModal) {
    const closeButton = document.createElement('div')
    closeButton.innerHTML = `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 100 100"
      >
        <line x1="10" y1="10" x2="90" y2="90" stroke="white" stroke-width="10" />
        <line x1="10" y1="90" x2="90" y2="10" stroke="white" stroke-width="10" />
      </svg>`
    closeButton.classList.add('flatfile-close-button')
    // Add the onclick event to the button
    closeButton.onclick = () => {
      const outerShell = document.querySelector(
        '.flatfile_outer-shell'
      ) as HTMLElement
      if (outerShell) {
        outerShell.style.display = 'block'
      } else {
        // Show the confirm modal instead of creating a new one
        confirmModal.style.display = 'block'
      }
    }

    domElement
      .getElementsByClassName('flatfile_iframe-wrapper')[0]
      .appendChild(closeButton)
  }
}

type InitSpaceType = ISpace & {
  isAutoConfig: boolean
}

// TODO: Replace hardcoded type with imported type from Platform
export interface InitialResourceData {
  workbooks: Flatfile.Workbook[] | null
  documents: Flatfile.Document[] | null
  space: Flatfile.Space
  actor: Flatfile.User | Flatfile.Guest | undefined
  entitlements: any[]
  environment: Partial<Flatfile.Environment> & {
    hasAccess: boolean
  }
}

/**
 * Full-service utility which takes incoming space configuration data and calls the internal backend-for-frontend
 * endpoint to create the space, workbook, and document in a single request.
 *
 * The resulting response is the full set of initial resources needed to render the UI experience
 * @param param0
 * @returns
 */
const initNewSpace = async ({
  publishableKey,
  apiUrl,
  name,
  environmentId,
  spaceBody,
  namespace = 'portal',
  translationsPath,
  languageOverride,
  themeConfig,
  sidebarConfig,
  labels,
  metadata,
  userInfo,
  workbook,
  document,
  isAutoConfig,
}: InitSpaceType): Promise<InitialResourceData> => {
  const createSpaceEndpoint = `${apiUrl}/v1/internal/spaces/init?publishableKey=${publishableKey}`

  let defaultPage
  let defaultPageSet = false

  let spaceRequestBody: any = {
    space: {
      name: name || 'Embedded Space',
      ...spaceBody,
      autoConfigure: isAutoConfig,
      ...(environmentId ? { environmentId } : {}),
      labels: ['embedded', ...(labels || [])],
      ...(namespace ? { namespace } : {}),
      ...(translationsPath ? { translationsPath } : {}),
      ...(languageOverride ? { languageOverride } : {}),
      metadata: {
        theme: themeConfig,
        sidebarConfig: sidebarConfig || { showSidebar: false },
        userInfo,
        ...(spaceBody?.metadata || {}),
        ...(metadata || {}),
      },
    },
  }

  const addResourceToRequestBody = (resource: any, resourceName: string) => {
    spaceRequestBody = {
      ...spaceRequestBody,
      [resourceName]: resource,
    }
  }
  const setDefaultPage = (incomingDefaultPage: DefaultPageType) => {
    if (defaultPageSet === true) {
      console.warn(
        'Default page is already set. Multiple default pages are not allowed.'
      )
    } else {
      defaultPage = incomingDefaultPage
      defaultPageSet = true
    }
  }

  if (workbook) {
    addResourceToRequestBody(workbook, 'workbook')

    if (workbook.defaultPage) {
      setDefaultPage({ workbook: workbook.name })
    } else if (workbook.sheets) {
      const defaultSheet = workbook.sheets.find((sheet) => sheet.defaultPage)
      if (defaultSheet && defaultSheet.slug) {
        setDefaultPage({ workbook: { sheet: defaultSheet.slug } })
      }
    }
  }

  if (document) {
    addResourceToRequestBody(document, 'document')

    if (document.defaultPage) {
      setDefaultPage({ document: document.title })
    }
  }

  const response = await fetch(createSpaceEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'text/plain',
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(spaceRequestBody),
  })

  const result = await response.json()
  if (!response.ok) {
    const errorMessage = result?.errors[0]?.message || 'Failed to create space'
    throw new Error(errorMessage)
  }

  const createdSpace = result.data

  ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace.space.accessToken

  if (defaultPage) await updateDefaultPageInSpace(createdSpace, defaultPage)

  return createdSpace
}

export async function startFlatfile(options: SimpleOnboarding | ISpace) {
  const {
    publishableKey,
    displayAsModal = true,
    mountElement = 'flatfile_iFrameContainer',
    space,
    spaceBody = undefined,
    apiUrl = 'https://platform.flatfile.com/api',
    baseUrl = 'https://platform.flatfile.com/s',
    spaceUrl = 'https://platform.flatfile.com/s',
    exitTitle = 'Close Window',
    exitText = 'Are you sure you would like to close this window? This will end your current data import session.',
    exitPrimaryButtonText = 'Yes, exit',
    exitSecondaryButtonText = 'No, stay',
    closeSpace,
    errorTitle = 'Something went wrong',
    name,
    environmentId,
    workbook,
    themeConfig,
    document: documentConfig,
    sidebarConfig,
    userInfo,
    listener,
    namespace,
    metadata,
    labels,
    translationsPath,
    languageOverride,
  } = options
  const simpleOnboardingOptions = options as SimpleOnboarding
  const isReusingSpace = !!(space?.id && space?.accessToken)
  const spacesUrl = spaceUrl || baseUrl
  let mountIFrameWrapper = document.getElementById(mountElement)
  const mountIFrameElement = mountIFrameWrapper
    ? mountIFrameWrapper.getElementsByTagName('iframe')[0]
    : null
  ;(window as any).CROSSENV_FLATFILE_API_URL = apiUrl
  /**
   * Customers can proactively preload the iFrame into the DOM - If we detect that an iFrame already exists
   * for the provided mountElementId - we can assume it has been preloaded, and simply make it visible
   **/
  if (mountIFrameWrapper && mountIFrameElement) {
    mountIFrameWrapper.style.display = 'block'
  }

  try {
    let spaceResult: any
    let initialResourceResponse
    let createdWorkbook = workbook
    let isAutoConfig = false

    if (!createdWorkbook) {
      if (!simpleOnboardingOptions.sheet) {
        isAutoConfig = true
      } else {
        createdWorkbook = createWorkbookFromSheet(
          simpleOnboardingOptions.sheet,
          !!simpleOnboardingOptions.onSubmit
        )
      }
    }

    if (isReusingSpace) {
      spaceResult = space
      ;(window as any).CROSSENV_FLATFILE_API_KEY = spaceResult?.accessToken
    }
    // Initialize new space / workbook / document and obtain response used to "initial resources" to hydrate embedded UI
    else if (publishableKey) {
      initialResourceResponse = await initNewSpace({
        publishableKey,
        apiUrl,
        name,
        spaceBody,
        namespace,
        environmentId,
        translationsPath,
        languageOverride,
        themeConfig,
        sidebarConfig,
        labels,
        metadata,
        userInfo,
        workbook: createdWorkbook,
        document: documentConfig,
        isAutoConfig,
      })

      spaceResult = initialResourceResponse.space
    }

    if (!spaceResult?.id || !spaceResult?.accessToken) {
      throw new Error('Unable to create space, please try again.')
    }
    // Set these for handy use in the listeners for authenticating the @flatfile/api client

    let removeMessageListener: () => void | undefined

    const simpleListenerSlug: string =
      createdWorkbook?.sheets?.[0].slug || 'slug'

    if (listener) {
      removeMessageListener = await createlistener(
        spaceResult.accessToken,
        apiUrl,
        listener,
        closeSpace
      )
    } else {
      removeMessageListener = await createlistener(
        spaceResult.accessToken,
        apiUrl,
        createSimpleListener({
          onRecordHook: simpleOnboardingOptions?.onRecordHook,
          onSubmit: simpleOnboardingOptions?.onSubmit,
          slug: simpleListenerSlug,
        }),
        closeSpace
      )
    }

    /**
     * Customers can proactively preload the iFrame into the DOM - If we detect that an iFrame already exists
     * for the provided mountElementId then we pass a message to direct the iFrame to the spaces-UI route for
     * the created spaceId
     *
     * If it has not been created yet, the iFrame is created on-demand, and routed to the specified space-id
     **/
    if (!mountIFrameElement) {
      mountIFrameWrapper = createIframe(
        mountElement,
        displayAsModal,
        spaceResult.id,
        spaceResult.accessToken,
        spaceResult?.guestLink ?? spacesUrl,
        isReusingSpace
      )
    } else {
      const targetOrigin = new URL(spacesUrl).origin
      const initialResources = initialResourceResponse || null
      console.log({ initialResources })
      mountIFrameElement.contentWindow?.postMessage(
        {
          flatfileEvent: {
            topic: 'portal:initialize',
            payload: {
              status: 'complete',
              spaceUrl: `${targetOrigin}/space/${
                spaceResult.id
              }?token=${encodeURIComponent(spaceResult.accessToken)}`,
              initialResources,
            },
          },
        },
        targetOrigin
      )
    }

    if (mountIFrameWrapper) {
      initializeIFrameConfirmationModal(
        mountIFrameWrapper,
        displayAsModal,
        exitTitle,
        exitText,
        exitPrimaryButtonText,
        exitSecondaryButtonText,
        closeSpace,
        removeMessageListener,
        simpleOnboardingOptions?.onCancel
      )
    }

    return { spaceId: spaceResult.id }
  } catch (error) {
    const wrapper = document.getElementById(mountElement)
    const errorMessage = displayError(errorTitle, error as string)
    wrapper?.appendChild(errorMessage)
  }
}

export const initializeFlatfile = startFlatfile
export { createIframe }
