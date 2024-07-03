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
   * @description Updates a request body with a specified resource name by merging the
   * existing body with an updated value for that resource.
   * 
   * @param {any} resource - additional resource to be included in the space request body.
   * 
   * @param {string} resourceName - name of the resource for which the space request
   * body is being constructed.
   */
  const addResourceToRequestBody = (resource: any, resourceName: string) => {
    spaceRequestBody = {
      ...spaceRequestBody,
      [resourceName]: resource,
    }
  }
  /**
   * @description Sets a page as the default page for a given type, preventing multiple
   * default pages from being set.
   * 
   * @param {DefaultPageType} incomingDefaultPage - default page to be set or retrieved
   * within the function.
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
