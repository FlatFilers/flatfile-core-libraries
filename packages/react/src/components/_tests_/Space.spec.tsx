import React from 'react'
import { Space } from '../Space'
import { FlatfileContext, FlatfileContextType } from '../FlatfileContext'
import { SheetConfig } from '@flatfile/api/api'
import FlatfileListener from '@flatfile/listener'
import { Root, createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'

import '@testing-library/jest-dom'
import { waitFor } from '@testing-library/react'

const mockContextValue: FlatfileContextType = {
  updateSpace: jest.fn(),
  createSpace: jest.fn(),
  apiUrl: 'https://example.com',
  open: true,
  setOpen: jest.fn(),
  setSessionSpace: jest.fn(),
  listener: new FlatfileListener(),
  setListener: function (listener: FlatfileListener): void {
    throw new Error('Function not implemented.')
  },
  setAccessToken: function (accessToken: string): void {
    throw new Error('Function not implemented.')
  },
  addSheet: function (config: any): void {
    throw new Error('Function not implemented.')
  },
  updateSheet: function (
    sheetSlug: string,
    sheetUpdates: Partial<SheetConfig>
  ): void {
    throw new Error('Function not implemented.')
  },
  updateWorkbook: function (config: any): void {
    throw new Error('Function not implemented.')
  },
  updateDocument: function (config: any): void {
    throw new Error('Function not implemented.')
  },
  setCreateSpace: function (config: any): void {
    throw new Error('Function not implemented.')
  },
}

describe('Space', () => {
  let root: Root
  let container: Element | DocumentFragment

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders children when provided', async () => {
    const mockConfig = {
      id: 'spaceId',
      // Add other necessary properties to mockConfig
    }
    act(() => {
      root.render(
        <FlatfileContext.Provider value={mockContextValue}>
          <Space config={mockConfig}>
            <div id="child-element">Child Element</div>
          </Space>
        </FlatfileContext.Provider>
      )
    })

    await waitFor(() => {
      const childElement = document.getElementById('child-element')
      expect(childElement).toBeInTheDocument()
    })
  })

  it('does not render children when not provided', async () => {
    const mockConfig = {
      id: 'spaceId',
      // Add other necessary properties to mockConfig
    }
    act(() => {
      root.render(
        <FlatfileContext.Provider value={mockContextValue}>
          <Space config={mockConfig} />
        </FlatfileContext.Provider>
      )
    })
    await waitFor(() => {
      const childElement = document.getElementById('child-element')
      expect(childElement).not.toBeInTheDocument()
    })
  })

  // Add more test cases as needed
})
