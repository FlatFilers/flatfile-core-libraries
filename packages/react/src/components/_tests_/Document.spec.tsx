import React from 'react'
import { render } from '@testing-library/react'
import { Document } from '../Document'
import FlatfileContext from '../FlatfileContext'
import { useDeepCompareEffect } from '../../utils/useDeepCompareEffect'
import { FlatfileProviderValue } from './FlatfileProvider.spec'

jest.mock('../../utils/useDeepCompareEffect', () => ({
  useDeepCompareEffect: jest.fn(),
}))

const MockDocumentConfig = { title: 'Test Document', body: 'Document Content ' }

describe('Document', () => {
  const mockUpdateDocument = jest.fn()

  // This sets up the context value that will be used in all tests
  beforeEach(() => {
    jest.mocked(useDeepCompareEffect).mockImplementation((callback, deps) => {
      React.useEffect(callback, deps)
    })
    jest.clearAllMocks()
  })

  it('calls updateDocument with config on initial render', () => {
    // Provide the mock context to the component
    render(
      <FlatfileContext.Provider
        value={{
          ...FlatfileProviderValue,
          updateDocument: mockUpdateDocument,
        }}
      >
        <Document config={MockDocumentConfig} />
      </FlatfileContext.Provider>
    )

    // Check if updateDocument was called with the correct config
    expect(mockUpdateDocument).toHaveBeenCalledWith(MockDocumentConfig)
  })

  it('calls updateDocument with new config when config changes', () => {
    const newConfig = { ...MockDocumentConfig, title: 'newConfig' }
    const { rerender } = render(
      <FlatfileContext.Provider
        value={{
          ...FlatfileProviderValue,
          updateDocument: mockUpdateDocument,
        }}
      >
        <Document config={MockDocumentConfig} />
      </FlatfileContext.Provider>
    )

    // Rerender with new props
    rerender(
      <FlatfileContext.Provider
        value={{
          ...FlatfileProviderValue,
          updateDocument: mockUpdateDocument,
        }}
      >
        <Document config={newConfig} />
      </FlatfileContext.Provider>
    )

    // The useEffect should run the callback again with the new config
    expect(mockUpdateDocument).toHaveBeenCalledTimes(2)
    expect(mockUpdateDocument).toHaveBeenCalledWith(newConfig)
  })
})
