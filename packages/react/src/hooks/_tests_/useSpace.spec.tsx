/**
 * @jest-environment jsdom
 */

import { FlatfileClient } from '@flatfile/api'
import { render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import DefaultError from '../../components/Error'
import Space from '../../components/Space'
import { mockDocument, mockSpace, mockWorkbook } from '../../test/mocks'
import { ISpace } from '@flatfile/embedded-utils'
import useSpace from '../useSpace'
import '@testing-library/jest-dom'

const baseSpaceProps = {
  loading: undefined,
  publishableKey: 'your-publishable-key',
  environmentId: 'your-env-id',
  workbook: mockWorkbook,
  name: 'Embedded space',
}

const TestComponent: React.FC<ISpace> = (props) => {
  const result = useSpace(props)
  return <div>{result}</div>
}

const renderUseSpaceHook = (props: ISpace) =>
  // @ts-ignore
  render(<TestComponent {...props} />)

const renderUseSpaceHookWithHookResult = (props: ISpace) =>
  renderHook(() => useSpace(props))

describe('useSpace', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('renders the loading element when pubNub is not yet available', () => {
    const { getByTestId } = renderUseSpaceHook({
      ...baseSpaceProps,
    } as ISpace)

    expect(getByTestId('spinner-icon')).toBeInTheDocument()
  })
  it('renders the error element when there is an error', async () => {
    jest
      .spyOn(FlatfileClient.prototype.spaces, 'create')
      .mockRejectedValue('There has been an error my friend')
    const { result, waitForNextUpdate } = renderUseSpaceHookWithHookResult({
      ...baseSpaceProps,
    } as ISpace)

    await waitForNextUpdate()

    const error = result?.current?.type === DefaultError ? result?.current : undefined

    expect(error).toBeDefined()
  })
  it('renders the Space component when authenticated', async () => {
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

    const { result, waitForNextUpdate } = renderUseSpaceHookWithHookResult({
      ...baseSpaceProps,
    } as ISpace)

    await waitForNextUpdate()

    const spaceComponent = result?.current?.type === Space ? result?.current : undefined

    expect(spaceComponent).toBeDefined()
  })
})
