/**
 * @jest-environment jsdom
 */

import { FlatfileClient } from '@flatfile/api'
import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react-hooks'
import DefaultError from '../../components/Error'
import Space from '../../components/Space'
import { mockDocument, mockSpace, mockWorkbook } from '../../test/mocks'
import { ISpace } from '@flatfile/embedded-utils'
import useSpace from '../useSpace'

console.error = jest.fn()

const baseSpaceProps = {
  loading: undefined,
  publishableKey: 'your-publishable-key',
  environmentId: 'your-env-id',
  workbook: mockWorkbook,
  name: 'Embedded space',
}

const renderUseSpaceHookWithHookResult = (props: ISpace) =>
  renderHook(() => useSpace(props))

describe('useSpace', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('renders the error element when there is an error', async () => {
    jest
      .spyOn(FlatfileClient.prototype.spaces, 'create')
      .mockRejectedValue('There has been an error my friend')
    const { result, waitForNextUpdate } = renderUseSpaceHookWithHookResult({
      ...baseSpaceProps,
    } as ISpace)

    await waitForNextUpdate()

    const error =
      result?.current?.type === DefaultError ? result?.current : undefined

    expect(error).toBeDefined()
  })
  it('renders the Space component when authenticated', async () => {
    jest.spyOn(FlatfileClient.prototype.spaces, 'create').mockResolvedValue({
      data: mockSpace,
    })

    jest.spyOn(FlatfileClient.prototype.workbooks, 'create').mockResolvedValue({
      data: mockWorkbook,
    })

    jest.spyOn(FlatfileClient.prototype.documents, 'create').mockResolvedValue({
      data: mockDocument,
    })

    const { result, waitForNextUpdate } = renderUseSpaceHookWithHookResult({
      ...baseSpaceProps,
    } as ISpace)

    await waitForNextUpdate()

    const spaceComponent =
      result?.current?.type === Space ? result?.current : undefined

    expect(spaceComponent).toBeDefined()
  })
})
