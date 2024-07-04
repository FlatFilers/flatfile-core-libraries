import {
  ISpace,
  SimpleOnboarding,
  createWorkbookFromSheet,
} from '@flatfile/embedded-utils'
import { createIframe } from './createIframe'
import { getI18n } from './i18n'
import { initNewSpace } from './initNewSpace'
import { createSimpleListener, createlistener } from './listener'
import { displayError, initializeIFrameConfirmationModal } from './utils'

/**
 * @description Generates high-quality documentation for given code and handles
 * onboarding for a Flatfile application, creating a space and workbook as needed,
 * obtaining an access token for authentication with the Flatfile API, and displaying
 * initial resources to the user.
 * 
 * @param {SimpleOnboarding | ISpace} options - 3-level object containing information
 * about the space creation, including properties like publishableKey, displayAsModal,
 * baseUrl, and API URL, which are used to generate the corresponding values for the
 * mount iframe configuration.
 * 
 * @returns {object} an object containing the ID of the created space.
 */
/**
 * @description Clears various elements associated with a web application. It removes
 * message listeners, a specific HTML element, and an IFRAME wrapper.
 */
export async function startFlatfile(options: SimpleOnboarding | ISpace) {
  function closeSpaceNow() {
    removeMessageListener?.()
    document.querySelector('.flatfile_outer-shell')?.remove?.()
    mountIFrameWrapper?.remove?.()
  }

  let removeMessageListener: (() => void) | undefined

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

  const i18n = getI18n(languageOverride)

  /**
   * Use custom text overrides first,
   * falling back to i18next for translations,
   * or finally static defaults
   */
  const exitTitle = customExitTitle || i18n.t('host.exitTitle', 'Close Window')
  const exitText =
    customExitText ||
    i18n.t(
      'host.exitText',
      'Are you sure you would like to close this window? This will end your current data import session.'
    )
  const exitPrimaryButtonText =
    customExitPrimaryButtonText ||
    i18n.t('host.exitPrimaryButtonText', 'Yes, exit')
  const exitSecondaryButtonText =
    customExitSecondaryButtonText ||
    i18n.t('host.exitSecondaryButtonText', 'No, stay')
  const errorTitle =
    customErrorTitle || i18n.t('host.errorTitle', 'Something went wrong')

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

    const simpleListenerSlug: string =
      createdWorkbook?.sheets?.[0].slug || 'slug'

    if (listener) {
      removeMessageListener = await createlistener(
        spaceResult.accessToken,
        apiUrl,
        listener,
        closeSpace,
        closeSpaceNow
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
        closeSpace,
        closeSpaceNow
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
        closeSpaceNow,
        closeSpace,
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
