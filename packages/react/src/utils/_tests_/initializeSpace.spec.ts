import { FlatfileClient } from '@flatfile/api'
import { Space } from '@flatfile/api/api/resources/spaces'
import { ISpace } from '@flatfile/embedded-utils'
import { initializeSpace } from '../initializeSpace'
import { mockDocument, mockSpace } from '../../test/mocks'

var authenticateMock: jest.Mock = jest.fn()
var addSpaceInfoMock: jest.Mock = jest.fn()

const mockWorkbook = {
  id: 'wb-id',
  sheets: [],
  environmentId: 'your-environment-id',
  name: 'Test Workbook',
  actions: [],
  spaceId: 'test-space-id',
  createdAt: new Date('01/01/2000'),
  updatedAt: new Date('01/01/2001'),
}

const mockSpaceProps: ISpace = {
  publishableKey: 'your-publishable-key',
  environmentId: 'your-environment-id',
  name: 'your-space-name',
  workbook: mockWorkbook,
}

describe('initializeSpace', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should throw an error when publishable key is missing', async () => {
    const invalidSpaceProps: ISpace = {
      ...mockSpaceProps,
      publishableKey: '',
    }

    await expect(initializeSpace(invalidSpaceProps)).rejects.toThrowError(
      'Missing required publishable key'
    )
    expect(authenticateMock).not.toHaveBeenCalled()
    expect(addSpaceInfoMock).not.toHaveBeenCalled()
  })

  it('should throw an error when environment id is missing', async () => {
    const invalidSpaceProps: ISpace = {
      ...mockSpaceProps,
      environmentId: '',
    }

    await expect(initializeSpace(invalidSpaceProps)).rejects.toThrowError(
      'Missing required environment id'
    )
    expect(authenticateMock).not.toHaveBeenCalled()
    expect(addSpaceInfoMock).not.toHaveBeenCalled()
  })

  it('should throw an error when space creation fails', async () => {
    const error = new Error('Space creation error')

    jest
      .spyOn(FlatfileClient.prototype.spaces, 'create')
      .mockRejectedValue(error)

    await expect(initializeSpace(mockSpaceProps)).rejects.toThrowError(
      'Failed to create space'
    )
    expect(addSpaceInfoMock).not.toHaveBeenCalled()
  })

  it('should initialize a space and return the created space', async () => {
    jest.spyOn(FlatfileClient.prototype.spaces, 'create').mockResolvedValue({
      data: mockSpace,
    })

    jest.spyOn(FlatfileClient.prototype.workbooks, 'create').mockResolvedValue({
      data: mockWorkbook,
    })

    jest.spyOn(FlatfileClient.prototype.spaces, 'update').mockResolvedValue({
      data: mockSpace,
    })

    jest.spyOn(FlatfileClient.prototype.documents, 'create').mockResolvedValue({
      data: mockDocument,
    })

    const result = await initializeSpace(mockSpaceProps)

    expect(result).toStrictEqual({ data: mockSpace })
  })
})
