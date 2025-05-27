import {
  createListener,
  createSimpleListener,
  createWorkbookFromSheet,
  InitialResourceData,
  initNewSpace,
  ISpace,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import { createIframe } from './createIframe'
import { getI18n, Translations } from './i18n'
import { displayError, initializeIFrameConfirmationModal } from './utils'

export async function startFlatfile(options: SimpleOnboarding | ISpace) {
  function closeSpaceNow() {
    removeMessageListener?.()
    document.querySelector('.flatfile_outer-shell')?.remove?.()
    mountIFrameWrapper?.remove?.()
    // Clean up retry timeouts
    retryTimeouts.forEach((timeoutId) => clearTimeout(timeoutId))
    retryTimeouts.clear()
    // Remove message listener
    if (messageListener) {
      window.removeEventListener('message', messageListener)
    }
  }

  let removeMessageListener: (() => void) | undefined
  const retryTimeouts = new Set<number>()
  const acknowledgedMessages = new Set<string>()
  let messageListener: ((event: MessageEvent) => void) | null = null

  let i18n: { t(key: string, defaultText: string): string } = {
    t(_key: string, defaultText: string) {
      return defaultText
    },
  }

  const onInit = ({
    localTranslations,
  }: {
    localTranslations: Translations
  }) => {
    i18n = getI18n(localTranslations, languageOverride)
  }

  const {
    publishableKey,
    displayAsModal = true,
    mountElement = 'flatfile_iFrameContainer',
    space,
    spaceBody = undefined,
    apiUrl = 'https://platform.flatfile.com/api',
    baseUrl = 'https://platform.flatfile.com/s',
    spaceUrl = 'https://platform.flatfile.com/s',
    closeSpace,
    errorTitle: customErrorTitle,
    exitPrimaryButtonText: customExitPrimaryButtonText,
    exitSecondaryButtonText: customExitSecondaryButtonText,
    exitText: customExitText,
    exitTitle: customExitTitle,
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
    translationsPath, // used inside the Space iframe only, not the wrapper
    languageOverride, // used for both the wrapper and the Space iframe
    externalActorId,
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

  /**
   * Use custom text overrides first,
   * falling back to i18next for translations,
   * or finally static defaults
   */
  const exitTitle = () =>
    customExitTitle || i18n.t('host.modals.closeModal.title', 'Close Window')
  const exitText = () =>
    customExitText ||
    i18n.t(
      'host.modals.closeModal.message',
      'Are you sure you would like to close this window? This will end your current data import session.'
    )
  const exitPrimaryButtonText = () =>
    customExitPrimaryButtonText ||
    i18n.t('host.modals.closeModal.primaryButtonText', 'Yes, exit')
  const exitSecondaryButtonText = () =>
    customExitSecondaryButtonText ||
    i18n.t('host.modals.closeModal.secondaryButtonText', 'No, stay')
  const errorTitle = () =>
    customErrorTitle || i18n.t('host.errorModal.title', 'Something went wrong')

  try {
    let spaceResult: any
    let initialResourceResponse: InitialResourceData | null = null
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
        apiUrl,
        document: documentConfig,
        environmentId,
        isAutoConfig,
        labels,
        languageOverride,
        metadata,
        name,
        namespace,
        publishableKey,
        sidebarConfig,
        spaceBody,
        themeConfig,
        translationsPath,
        userInfo,
        workbook: createdWorkbook,
        externalActorId,
      })

      spaceResult = initialResourceResponse.space
    }

    if (!spaceResult?.id || !spaceResult?.accessToken) {
      throw new Error('Unable to create space, please try again.')
    }
    // Set these for handy use in the listeners for authenticating the @flatfile/api client

    const simpleListenerSlug: string =
      createdWorkbook?.sheets?.[0].slug || 'slug'

    if (listener) {
      removeMessageListener = await createListener(
        spaceResult.accessToken,
        apiUrl,
        listener,
        closeSpace,
        closeSpaceNow,
        onInit
      )
    } else {
      removeMessageListener = await createListener(
        spaceResult.accessToken,
        apiUrl,
        createSimpleListener({
          onRecordHook: simpleOnboardingOptions?.onRecordHook,
          onSubmit: simpleOnboardingOptions?.onSubmit,
          slug: simpleListenerSlug,
          submitSettings: simpleOnboardingOptions?.submitSettings,
        }),
        closeSpace,
        closeSpaceNow,
        onInit
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

      // Set up message listener for acknowledgments
      messageListener = (event: MessageEvent) => {
        const { flatfileEvent } = event.data
        if (
          flatfileEvent?.topic === 'portal:initialize:ack' &&
          flatfileEvent?.payload?.status === 'acknowledged'
        ) {
          const messageId = flatfileEvent.payload.originalMessageId
          if (messageId) {
            console.debug(`Received acknowledgment for messageId: ${messageId}`)
            acknowledgedMessages.add(messageId)
          }
        }
      }
      window.addEventListener('message', messageListener)

      // Function to send initialize message with retry logic
      const sendInitializeMessage = (retryCount = 0) => {
        if (!mountIFrameElement?.contentWindow) {
          return
        }

        const messageId = `init_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 11)}`

        // Don't send if already acknowledged
        if (acknowledgedMessages.has(messageId)) {
          return
        }

        console.debug(
          `Sending portal:initialize message (attempt ${
            retryCount + 1
          }), messageId: ${messageId}`
        )

        mountIFrameElement.contentWindow.postMessage(
          {
            flatfileEvent: {
              topic: 'portal:initialize',
              payload: {
                status: 'complete',
                messageId,
                spaceUrl: `${targetOrigin}/space/${
                  spaceResult.id
                }?token=${encodeURIComponent(spaceResult.accessToken)}`,
                initialResourceResponse,
              },
            },
          },
          targetOrigin
        )

        // Set up retry logic (max 5 retries with exponential backoff)
        if (retryCount < 5) {
          const retryDelay = Math.min(500 * Math.pow(2, retryCount), 8000) // Cap at 8 seconds
          const timeoutId = setTimeout(() => {
            retryTimeouts.delete(timeoutId as unknown as number)
            if (!acknowledgedMessages.has(messageId)) {
              console.debug(
                `No acknowledgment received for messageId ${messageId}, retrying...`
              )
              sendInitializeMessage(retryCount + 1)
            }
          }, retryDelay) as unknown as number

          retryTimeouts.add(timeoutId)
        } else {
          console.warn(
            `Failed to receive acknowledgment after ${
              retryCount + 1
            } attempts for messageId: ${messageId}`
          )
        }
      }

      // Send initial message
      sendInitializeMessage()
    }

    if (mountIFrameWrapper) {
      initializeIFrameConfirmationModal(
        mountIFrameWrapper,
        displayAsModal,
        exitTitle,
        exitText,
        exitPrimaryButtonText,
        exitSecondaryButtonText,
        closeSpaceNow,
        closeSpace,
        simpleOnboardingOptions?.onCancel
      )
    }

    return { spaceId: spaceResult.id }
  } catch (error) {
    const wrapper = document.getElementById(mountElement)
    const errorMessage = displayError(errorTitle(), error as string)
    wrapper?.appendChild(errorMessage)
  }
}
