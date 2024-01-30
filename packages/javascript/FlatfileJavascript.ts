import api, { Flatfile } from '@flatfile/api'
import { Browser, FlatfileEvent, FlatfileListener } from '@flatfile/listener'

import {
  DefaultSubmitSettings,
  ISidebarConfig,
  ISpace,
  IThemeConfig,
  IUserInfo,
  JobHandler,
  NewSpaceFromPublishableKey,
  SheetHandler,
  SimpleOnboarding,
  createWorkbookFromSheet,
} from '@flatfile/embedded-utils'
import { createIframe } from './src/createIframe'
import { createDocument } from './src/services/document'
import { updateSpace } from './src/services/space'
import { createWorkbook } from './src/services/workbook'

import { FlatfileRecord } from '@flatfile/hooks'
import { recordHook } from '@flatfile/plugin-record-hook'
import { createModal } from './src/createModal'
import { CreateWorkbookConfig } from '@flatfile/api/api'

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
  // todo: should we use CrossEnvConfig here?
  // CrossEnvConfig.set('FLATFILE_API_KEY', accessToken)
  ;(window as any).CROSSENV_FLATFILE_API_KEY = accessToken

  listener.mount(
    new Browser({
      apiUrl,
      accessToken,
      fetchApi: fetch,
    })
  )
  const dispatchEvent = (event: any) => {
    if (!event) return

    const eventPayload = event.src ? event.src : event
    const eventInstance = new FlatfileEvent(eventPayload, accessToken, apiUrl)

    return listener?.dispatchEvent(eventInstance)
  }

  const handlePostMessage = (event: any) => {
    const { flatfileEvent } = event.data
    if (!flatfileEvent) return
    if (
      flatfileEvent.topic === 'job:outcome-acknowledged' &&
      flatfileEvent.payload.status === 'complete' &&
      flatfileEvent.payload.operation === closeSpace?.operation
    ) {
      closeSpace?.onClose({})
    }
    dispatchEvent(flatfileEvent)
  }

  window.addEventListener('message', handlePostMessage, false)
  const removeListener = () => removeEventListener('message', handlePostMessage)
  return removeListener
}

export interface UpdateSpaceInfo {
  apiUrl: string
  publishableKey?: string
  workbook?: Pick<Flatfile.CreateWorkbookConfig, 'name' | 'sheets' | 'actions'>
  spaceId: string
  environmentId: string
  mountElement: string
  errorTitle: string
  themeConfig?: IThemeConfig
  document?: Flatfile.DocumentConfig
  sidebarConfig?: ISidebarConfig
  userInfo?: Partial<IUserInfo>
  spaceInfo?: Partial<IUserInfo>
  accessToken: string
  spaceBody?: any
}

const updateSpaceInfo = async (data: UpdateSpaceInfo) => {
  const { mountElement, errorTitle, document: documentConfig, workbook } = data

  try {
    if (workbook) {
      await createWorkbook(data)
    }
    await updateSpace(data)

    if (documentConfig) {
      await createDocument(data)
    }
  } catch (error) {
    const wrapper = document.getElementById(mountElement)
    const errorMessage = displayError(errorTitle, error as string)
    wrapper?.appendChild(errorMessage)
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
    if (onRecordHook) {
      client.use(
        recordHook(
          slug,
          async (record: FlatfileRecord, event: FlatfileEvent | undefined) =>
            // @ts-ignore - something weird with the `data` prop and the types upstream in the packages being declared in different places, but overall this is fine
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
  closeSpace?: {
    operation: string
    onClose: (data: any) => void
  },
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
      closeSpace?.onClose({})
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
      if (removeMessageListener) removeMessageListener()
    }

    domElement
      .getElementsByClassName('flatfile_iframe-wrapper')[0]
      .appendChild(closeButton)
  }
}

export async function startFlatfile(options: SimpleOnboarding | ISpace) {
  const {
    publishableKey,
    displayAsModal = true,
    mountElement = 'flatfile_iFrameContainer',
    space,
    spaceBody = null,
    apiUrl = 'https://platform.flatfile.com/api',
    baseUrl = 'https://spaces.flatfile.com',
    spaceUrl = 'https://spaces.flatfile.com',
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
    spaceInfo,
    listener,
  } = options
  const simpleOnboardingOptions = options as SimpleOnboarding
  const isReusingSpace = !!(space?.id && space?.accessToken)
  const spacesUrl = spaceUrl || baseUrl
  let mountIFrameWrapper = document.getElementById(mountElement)
  const mountIFrameElement = mountIFrameWrapper
    ? mountIFrameWrapper.getElementsByTagName('iframe')[0]
    : null

  /**
   * Customers can proactively preload the iFrame into the DOM - If we detect that an iFrame already exists
   * for the provided mountElementId - we can assume it has been preloaded, and simply make it visible
   **/
  if (mountIFrameWrapper && mountIFrameElement) {
    mountIFrameWrapper.style.display = 'block'
  }

  try {
    const createSpaceEndpoint = `${apiUrl}/v1/spaces`
    let createdWorkbook = workbook
    const createSpace = async () => {
      const spaceRequestBody = {
        name: name || 'Embedded Space',
        autoConfigure: false,
        labels: ['embedded'],
        ...spaceBody,
        metadata: {
          theme: themeConfig,
          sidebarConfig: sidebarConfig ? sidebarConfig : { showSidebar: false },
          userInfo,
          ...(spaceBody?.metadata || {}),
        },
      }

      if (!createdWorkbook && !simpleOnboardingOptions?.sheet) {
        spaceRequestBody.autoConfigure = true
      }

      if (!createdWorkbook && simpleOnboardingOptions?.sheet) {
        createdWorkbook = createWorkbookFromSheet(
          simpleOnboardingOptions?.sheet,
          !!simpleOnboardingOptions?.onSubmit
        )
      }

      const response = await fetch(createSpaceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publishableKey}`,
        },
        body: JSON.stringify(spaceRequestBody),
      })

      const result = await response.json()
      if (!response.ok) {
        const errorMessage =
          result?.errors[0]?.message || 'Failed to create space'
        throw new Error(errorMessage)
      }

      return result.data
    }

    const spaceData = isReusingSpace ? space : await createSpace()

    if (!spaceData?.id || !spaceData?.accessToken) {
      throw new Error('Unable to create space, please try again.')
    }

    let removeMessageListener: () => void | undefined

    const simpleListenerSlug: string =
      createdWorkbook?.sheets?.[0].slug || 'slug'

    if (listener) {
      removeMessageListener = await createlistener(
        spaceData.accessToken,
        apiUrl,
        listener,
        closeSpace
      )
    } else {
      removeMessageListener = await createlistener(
        spaceData.accessToken,
        apiUrl,
        createSimpleListener({
          onRecordHook: simpleOnboardingOptions?.onRecordHook,
          onSubmit: simpleOnboardingOptions?.onSubmit,
          slug: simpleListenerSlug,
        }),
        closeSpace
      )
    }
    if (!isReusingSpace) {
      await updateSpaceInfo({
        apiUrl,
        publishableKey,
        workbook: createdWorkbook as Pick<
          CreateWorkbookConfig,
          'name' | 'sheets' | 'actions'
        >,
        spaceId: spaceData.id,
        accessToken: spaceData.accessToken,
        environmentId,
        mountElement,
        errorTitle,
        themeConfig,
        document: documentConfig,
        sidebarConfig,
        userInfo,
        spaceInfo,
      })
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
        spaceData.id,
        spaceData.accessToken,
        spaceData?.guestLink ?? spacesUrl,
        isReusingSpace
      )
    } else {
      const targetOrigin = new URL(spacesUrl).origin
      mountIFrameElement.contentWindow?.postMessage(
        {
          flatfileEvent: {
            topic: 'portal:initialize',
            payload: {
              status: 'complete',
              spaceUrl: `${spacesUrl}/space/${
                spaceData.id
              }?token=${encodeURIComponent(spaceData.accessToken)}`,
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

    return { spaceId: spaceData.id }
  } catch (error) {
    const wrapper = document.getElementById(mountElement)
    const errorMessage = displayError(errorTitle, error as string)
    wrapper?.appendChild(errorMessage)
  }
}

export const initializeFlatfile = startFlatfile
export { createIframe }
