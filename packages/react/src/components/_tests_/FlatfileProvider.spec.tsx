import React, { useContext } from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { FlatfileProvider } from '../FlatfileProvider'
import FlatfileContext from '../FlatfileContext'
import * as initializeSpace from '../../utils/initializeSpace'
import * as getSpace from '../../utils/getSpace'
// import FlatfileListener from '@flatfile/listener'
import fetchMock from 'jest-fetch-mock'
import { useFlatfile } from '../../hooks/useFlatfile'

fetchMock.enableMocks()
console.error = jest.fn()

jest.mock('../../utils/initializeSpace')
jest.mock('../../utils/getSpace')
jest.mock('@flatfile/listener')

const TestingComponent = () => {
  const { publishableKey, space } = useContext(FlatfileContext)

  return (
    <>
      {publishableKey && <p data-testid="publishableKey">{publishableKey}</p>}
      {space && <p data-testid="spaceId">{space.id}</p>}
    </>
  )
}

describe('FlatfileProvider', () => {
  jest.mock('@flatfile/listener', () => ({
    default: jest.fn().mockImplementation(() => ({
      mount: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  }))

  test('creates space with publishable key', async () => {
    const mockSpace = {
      data: {
        accessToken: 'test-access-token',
      },
    }

    jest.mock('../../utils/initializeSpace', () => ({
      initializeSpace: jest.fn().mockResolvedValue(mockSpace),
    }))

    const { getByTestId } = render(
      <FlatfileProvider publishableKey="test-key" environmentId="test-env">
        <TestingComponent />
      </FlatfileProvider>
    )

    await waitFor(() => {
      expect(initializeSpace.initializeSpace).toHaveBeenCalledWith({
        publishableKey: 'test-key',
        environmentId: 'test-env',
        apiUrl: 'https://platform.flatfile.com/api',
      })
    })

    await waitFor(() => {
      expect(getByTestId('publishableKey').innerHTML).toBe('test-key')
    })
    // Additional tests can include checking if the context values are set correctly, etc.
  })

  test('reuses existing space object', async () => {
    const mockSpace = {
      id: 'existing-space-id',
      accessToken: 'existing-access-token',
    }

    jest.mock('../../utils/getSpace', () => ({
      getSpace: jest.fn().mockResolvedValue(mockSpace),
    }))

    const { getByTestId } = render(
      <FlatfileProvider space={mockSpace} environmentId="test-env">
        <TestingComponent />
      </FlatfileProvider>
    )

    await waitFor(() => {
      expect(getSpace.getSpace).toHaveBeenCalledWith({
        space: mockSpace,
        environmentId: 'test-env',
        apiUrl: 'https://platform.flatfile.com/api',
      })
    })
    await waitFor(() => {
      expect(getByTestId('spaceId').innerHTML).toBe('existing-space-id')
    })
    // Additional tests can include checking if the context values are set correctly, etc.
  })

  // Further tests can be added to cover other functionalities such as postMessage handling, etc.
})
