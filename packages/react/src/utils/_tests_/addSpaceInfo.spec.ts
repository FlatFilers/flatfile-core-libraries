import { FlatfileClient } from '@flatfile/api'
import { CreateWorkbookConfig, Workbook } from '@flatfile/api/api'
import { Space } from '@flatfile/api/api/resources/spaces'
import { mockDocument, mockWorkbook } from '../../test/mocks'
import { addSpaceInfo } from '../addSpaceInfo'

describe('addSpaceInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  const innerWorkbook = {
    spaceId: 'test=space-id',
    createdAt: new Date('01/01/2000'),
    updatedAt: new Date('01/01/2001'),
  }
  const mockSpaceProps = {
    workbook: mockWorkbook as Pick<
      CreateWorkbookConfig,
      'name' | 'sheets' | 'actions'
    >,
    environmentId: 'test-environment-id',
    document: mockDocument,
    themeConfig: {},
    sidebarConfig: {},
    spaceInfo: {},
    publishableKey: 'test-pub-key',
  }

  const mockSpaceResponse = {
    id: 'test-space-id',
    isCollaborative: true,
    environmentId: 'test-environment-id',
    createdAt: new Date('01/01/2000'),
    updatedAt: new Date('01/01/2001'),
  }

  const mockSpaceId = 'test-space-id'
  const mockApi = new FlatfileClient()

  it('should add space information successfully', async () => {
    jest.spyOn(mockApi.workbooks, 'create').mockResolvedValueOnce({
      data: {
        id: 'test-workbook-id',
        ...innerWorkbook,
      } as Workbook,
    })

    jest.spyOn(mockApi.spaces, 'update').mockResolvedValueOnce({
      data: { ...mockSpaceResponse } as Space,
    })

    jest.spyOn(mockApi.documents, 'create').mockResolvedValueOnce({
      data: {
        id: 'test-document-id',
        title: 'doc-title',
        body: 'doc-body',
        createdAt: new Date('01/01/2000'),
        updatedAt: new Date('01/01/2001'),
      },
    })

    await addSpaceInfo(mockSpaceProps, mockSpaceId, mockApi)

    expect(mockApi.workbooks.create).toHaveBeenCalledWith({
      ...mockWorkbook,
      spaceId: mockSpaceId,
    })

    expect(mockApi.spaces.update).toHaveBeenCalledWith(mockSpaceId, {
      environmentId: mockSpaceProps.environmentId,
      metadata: {
        theme: {},
        sidebarConfig: {},
        spaceInfo: {},
      },
    })

    expect(mockApi.documents.create).toHaveBeenCalledWith(mockSpaceId, {
      title: mockDocument.title,
      body: mockDocument.body,
    })
  })

  it('should throw an error if creating workbook fails', async () => {
    jest
      .spyOn(mockApi.workbooks, 'create')
      .mockRejectedValueOnce(new Error('Failed to create workbook'))

    await expect(
      addSpaceInfo(mockSpaceProps, mockSpaceId, mockApi)
    ).rejects.toThrow(
      'Error adding workbook to space: Failed to create workbook'
    )
  })

  it('should throw an error if creating document fails', async () => {
    jest.spyOn(mockApi.workbooks, 'create').mockResolvedValueOnce({
      data: {
        id: 'test-workbook-id',
        ...innerWorkbook,
      } as Workbook,
    })

    jest.spyOn(mockApi.spaces, 'update').mockResolvedValueOnce({
      data: { ...mockSpaceResponse } as Space,
    })

    jest
      .spyOn(mockApi.documents, 'create')
      .mockRejectedValueOnce(new Error('Failed to create document'))

    await expect(
      addSpaceInfo(mockSpaceProps, mockSpaceId, mockApi)
    ).rejects.toThrow(
      'Error adding workbook to space: Failed to create document'
    )
  })

  it('should throw an error if updating space fails', async () => {
    jest.spyOn(mockApi.workbooks, 'create').mockResolvedValueOnce({
      data: {
        id: 'test-workbook-id',
        ...innerWorkbook,
      } as Workbook,
    })

    jest
      .spyOn(mockApi.spaces, 'update')
      .mockRejectedValueOnce(new Error('Failed to update space'))

    await expect(
      addSpaceInfo(mockSpaceProps, mockSpaceId, mockApi)
    ).rejects.toThrow('Error adding workbook to space: Failed to update space')
  })
})
