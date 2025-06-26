import FlatfileListener from '@flatfile/listener'
import { render, waitFor, screen } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import React, { createRef, useContext } from 'react'
import FlatfileContext, {
  DEFAULT_CREATE_SPACE,
  FlatfileContextType,
} from '../FlatfileContext'
import { FlatfileProvider } from '../FlatfileProvider'

export const FlatfileProviderValue: FlatfileContextType = {
  updateDocument: jest.fn(),
  apiUrl: '',
  open: false,
  setOpen: jest.fn(),
  onClose: createRef<undefined | (() => void)>(),
  setSessionSpace: jest.fn(),
  listener: new FlatfileListener(),
  setListener: jest.fn(),
  setAccessToken: jest.fn(),
  addSheet: jest.fn(),
  updateSheet: jest.fn(),
  removeSheet: jest.fn(),
  updateWorkbook: jest.fn(),
  createSpace: DEFAULT_CREATE_SPACE,
  setCreateSpace: jest.fn(),
  updateSpace: jest.fn(),
  defaultPage: undefined,
  setDefaultPage: jest.fn(),
  resetSpace: jest.fn(),
  ready: false,
  iframe: createRef<HTMLIFrameElement>(),
  isReusingSpace: false,
}

fetchMock.enableMocks()
console.error = jest.fn()

jest.mock('../../utils/initializeSpace')
jest.mock('../../utils/getSpace')
jest.mock('@flatfile/listener')

const TestingComponent = (props: { ReUsingSpace?: boolean }) => {
  const context = useContext(FlatfileContext)
  const { publishableKey, accessToken, createSpace } = context

  if (props.ReUsingSpace) {
    return <p data-testid="spaceId">{accessToken}</p>
  } else {
    return <p data-testid="publishableKey">{publishableKey}</p>
  }
}

describe('FlatfileProvider', () => {
  jest.mock('@flatfile/listener', () => ({
    default: jest.fn().mockImplementation(() => ({
      mount: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  }))

  test.skip('creates space with publishable key', async () => {
    const mockSpace = {
      data: {
        accessToken: 'test-access-token',
      },
    }

    jest.mock('../../utils/initializeSpace', () => ({
      initializeSpace: jest.fn().mockResolvedValue(mockSpace),
    }))

    const { getByTestId } = render(
      <FlatfileProvider publishableKey="test-key" config={{ preload: false }}>
        <TestingComponent />
      </FlatfileProvider>
    )

    await waitFor(() => {
      expect(getByTestId('publishableKey').innerHTML).toBe('test-key')
    })
    // Additional tests can include checking if the context values are set correctly, etc.
  })

  test.skip('reuses existing space object', async () => {
    const mockSpace = {
      id: 'existing-space-id',
      accessToken: 'existing-access-token',
    }

    jest.mock('../../utils/getSpace', () => ({
      getSpace: jest.fn().mockResolvedValue(mockSpace),
    }))

    const { getByTestId } = render(
      <FlatfileProvider
        accessToken={'existing-access-token'}
        config={{ preload: false }}
      >
        <TestingComponent ReUsingSpace />
      </FlatfileProvider>
    )

    await waitFor(() => {
      expect(getByTestId('spaceId').innerHTML).toBe('existing-access-token')
    })
  })

  test('start with null accessToken and then set valid accessToken', async () => {
    const mockSpace = {
      id: 'existing-space-id',
      accessToken: 'existing-access-token',
    }

    jest.mock('../../utils/getSpace', () => ({
      getSpace: jest.fn().mockResolvedValue(mockSpace),
    }))

    const { rerender  } = render(
      <FlatfileProvider
        accessToken=''
        config={{ preload: false }}
      >
        <TestingComponent ReUsingSpace />
      </FlatfileProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('spaceId').innerHTML).toBe('')
    })

    rerender(
      <FlatfileProvider
        accessToken={'existing-access-token'}
        config={{ preload: false }}
      >
        <TestingComponent ReUsingSpace />
      </FlatfileProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('spaceId').innerHTML).toBe('existing-access-token')
    })
  })
})
