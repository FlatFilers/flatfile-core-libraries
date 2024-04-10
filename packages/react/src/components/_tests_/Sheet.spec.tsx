import React from 'react'
import { render } from '@testing-library/react'
import { Sheet } from '../Sheet'
import FlatfileContext, {
  DEFAULT_CREATE_SPACE,
  FlatfileContextType,
} from '../FlatfileContext'
import { useDeepCompareEffect } from '../../utils/useDeepCompareEffect'
import { workbookOnSubmitAction } from '../../utils/constants'
import FlatfileListener from '@flatfile/listener'
import { Flatfile } from '@flatfile/api'

const MockFlatfileProviderValue: FlatfileContextType = {
  updateDocument: jest.fn(),
  apiUrl: '',
  open: false,
  setOpen: jest.fn(),
  setSessionSpace: jest.fn(),
  listener: new FlatfileListener(),
  setListener: jest.fn(),
  setAccessToken: jest.fn(),
  addSheet: jest.fn(),
  updateSheet: jest.fn(),
  updateWorkbook: jest.fn(),
  createSpace: DEFAULT_CREATE_SPACE,
  setCreateSpace: jest.fn(),
  updateSpace: jest.fn(),
}

jest.mock('../../utils/useDeepCompareEffect', () => ({
  useDeepCompareEffect: jest.fn(),
}))

const mockUpdateWorkbook = jest.fn()
const mockUpdateSheet = jest.fn()

const mockConfig: Flatfile.SheetConfig = {
  name: 'Test Sheet',
  slug: 'test-sheet',
  fields: [
    {
      label: 'First Name',
      key: 'firstName',
      type: 'string',
    },
    {
      label: 'Email',
      key: 'email',
      type: 'string',
    },
  ],
}

describe('Sheet', () => {
  beforeEach(() => {
    jest.mocked(useDeepCompareEffect).mockImplementation((callback, deps) => {
      React.useEffect(callback, deps)
    })
    jest.clearAllMocks()
  })

  it('calls updateSheet with config on initial render', () => {
    render(
      <FlatfileContext.Provider
        value={{
          ...MockFlatfileProviderValue,
          addSheet: mockUpdateSheet,
        }}
      >
        <Sheet config={mockConfig} />
      </FlatfileContext.Provider>
    )

    expect(mockUpdateSheet).toHaveBeenCalledWith(mockConfig)
  })

  it('calls updateSheet && updateWorkbook with updated config when onSubmit is provided', () => {
    const onSubmitMock = jest.fn()
    const updatedConfig = {
      ...mockConfig,
      actions: [workbookOnSubmitAction(mockConfig.slug)],
    }

    render(
      <FlatfileContext.Provider
        value={{
          ...MockFlatfileProviderValue,
          updateWorkbook: mockUpdateWorkbook,
          addSheet: mockUpdateSheet,
        }}
      >
        <Sheet config={mockConfig} onSubmit={onSubmitMock} />
      </FlatfileContext.Provider>
    )

    expect(mockUpdateSheet).toHaveBeenCalledWith(mockConfig)
    expect(mockUpdateWorkbook).toHaveBeenCalledWith({
      actions: [workbookOnSubmitAction(mockConfig.slug)],
    })
  })
  // More tests to check interaction during onSubmit and other complex logic
})
