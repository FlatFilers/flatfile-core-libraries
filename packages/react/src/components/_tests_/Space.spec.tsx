import React from 'react'
import { render } from '@testing-library/react'
import { Space } from '../Space'
import FlatfileContext from '../FlatfileContext'
import { useDeepCompareEffect } from '../../utils/useDeepCompareEffect'
import { MockFlatfileProviderValue } from './FlatfileProvider.spec'
jest.mock('../../utils/useDeepCompareEffect', () => ({
  useDeepCompareEffect: jest.fn(),
}))

const MockSpaceConfig = {
  name: 'Test Space',
}

describe('Space', () => {
  const mockUpdateSpace = jest.fn()

  beforeEach(() => {
    jest.mocked(useDeepCompareEffect).mockImplementation((callback, deps) => {
      React.useEffect(callback, deps)
    })
    jest.clearAllMocks()
  })

  it('calls updateSpace with config on initial render', () => {
    render(
      <FlatfileContext.Provider
        value={{ ...MockFlatfileProviderValue, updateSpace: mockUpdateSpace }}
      >
        <Space config={MockSpaceConfig} />
      </FlatfileContext.Provider>
    )

    expect(mockUpdateSpace).toHaveBeenCalledWith(MockSpaceConfig)
  })

  it('calls updateSpace with new config when config changes', () => {
    const newConfig = { ...MockSpaceConfig, name: 'New Test Area' }
    const { rerender } = render(
      <FlatfileContext.Provider
        value={{ ...MockFlatfileProviderValue, updateSpace: mockUpdateSpace }}
      >
        <Space config={MockSpaceConfig} />
      </FlatfileContext.Provider>
    )

    rerender(
      <FlatfileContext.Provider
        value={{ ...MockFlatfileProviderValue, updateSpace: mockUpdateSpace }}
      >
        <Space config={newConfig} />
      </FlatfileContext.Provider>
    )

    expect(mockUpdateSpace).toHaveBeenCalledTimes(2)
    expect(mockUpdateSpace).toHaveBeenCalledWith(newConfig)
  })
})
