import React, { useContext } from 'react'
import { render, waitFor } from '@testing-library/react'
import { FlatfileProvider } from '../FlatfileProvider'
import FlatfileContext from '../FlatfileContext'
import fetchMock from 'jest-fetch-mock'
fetchMock.enableMocks()
console.error = jest.fn()

jest.mock('../../utils/initializeSpace')
jest.mock('../../utils/getSpace')
jest.mock('@flatfile/listener')

const TestingComponent = (props: { ReUsingSpace?: boolean }) => {
  const { publishableKey, space } = useContext(FlatfileContext)

  if (props.ReUsingSpace) {
    return (
      <>{space && 'id' in space && <p data-testid="spaceId">{space.id}</p>}</>
    )
  } else {
    return (
      <>
        {publishableKey && <p data-testid="publishableKey">{publishableKey}</p>}
      </>
    )
  }
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
        <TestingComponent ReUsingSpace />
      </FlatfileProvider>
    )

    await waitFor(() => {
      expect(getByTestId('spaceId').innerHTML).toBe('existing-space-id')
    })
  })
})
