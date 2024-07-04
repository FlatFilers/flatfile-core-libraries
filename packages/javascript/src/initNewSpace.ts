import {
  DefaultPageType,
  updateDefaultPageInSpace,
} from '@flatfile/embedded-utils'
import { InitSpaceType, InitialResourceData } from './types'

/**
 * Full-service utility which takes incoming space configuration data and calls the internal backend-for-frontend
 * endpoint to create the space, workbook, and document in a single request.
 *
 * The resulting response is the full set of initial resources needed to render the UI experience
 * @param param0
 * @returns
 */
export const initNewSpace = async ({
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

  /**
   * @description Modifies a pre-existing request body object by adding a new key-value
   * pair where the key is the name of a resource and the value is the corresponding
   * resource itself.
   * 
   * @param {any} resource - resource to be added or updated within the space Request
   * Body.
   * 
   * @param {string} resourceName - name of the resource that should be updated in the
   * space Request body.
   */
  const addResourceToRequestBody = (resource: any, resourceName: string) => {
    spaceRequestBody = {
      ...spaceRequestBody,
      [resourceName]: resource,
    }
  }
  /**
   * @description Sets a default page for future user navigations, marking it as already
   * set if necessary and assigning it to a variable.
   * 
   * @param {DefaultPageType} incomingDefaultPage - default page that is to be set,
   * which determines whether a warning is issued or not.
   */
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
      const defaultSheet = workbook.sheets?.find?.((sheet) => sheet.defaultPage)
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
