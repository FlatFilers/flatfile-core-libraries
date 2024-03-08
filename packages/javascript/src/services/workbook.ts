import { UpdateSpaceInfo } from '../types'
import { Flatfile } from '@flatfile/api'

export const createWorkbook = async (data: UpdateSpaceInfo) => {
  const { apiUrl, accessToken, workbook, spaceId, environmentId } = data

  const createWorkbookEndpoint = `${apiUrl}/v1/workbooks`
  const response = await fetch(createWorkbookEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      spaceId,
      ...(environmentId !== undefined && { environmentId }),
      ...workbook,
    }),
  })
  const localWorkbook = await response.json()
  if (!localWorkbook || !localWorkbook.data || !localWorkbook.data.id) {
    throw new Error('Failed to create workbook')
  }

  if (!response.ok) {
    const errorMessage =
      localWorkbook?.errors[0]?.message || 'Failed to create workbook'
    throw new Error(errorMessage)
  }

  return localWorkbook.data
}

export const createWorkbookFromSheet = (
  sheet: Flatfile.SheetConfig,
  onSubmit?: boolean
): Flatfile.CreateWorkbookConfig => {
  const blueprint = {
    name: sheet?.name || 'Embedded Importer',
    sheets: [sheet],
  }
  return onSubmit
    ? {
        ...blueprint,
        actions: [
          {
            operation: 'simpleSubmitAction',
            mode: 'foreground',
            label: 'Submit',
            description: 'Action for handling data inside of onSubmit',
            primary: true,
          },
        ],
      }
    : blueprint
}
