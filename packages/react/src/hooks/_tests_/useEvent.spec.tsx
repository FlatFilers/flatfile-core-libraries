import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { useDeepCompareEffect } from '../../utils/useDeepCompareEffect'
import { useEvent } from '../../hooks'

import { Flatfile } from '@flatfile/api'
import { FlatfileProvider } from '../../components/FlatfileProvider'
import { Workbook } from '../../components'

jest.mock('../../utils/useDeepCompareEffect', () => ({
  useDeepCompareEffect: jest.fn(),
}))

const mockConfig: Flatfile.CreateWorkbookConfig = {
  name: 'Test Workbook',
  sheets: [
    {
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
    },
  ],
}

const APP = ({
  useEventFunction,
}: {
  useEventFunction: (event: {}) => void
}) => {
  useEvent('crazy:event', (event) => {
    useEventFunction(event)
  })

  useEvent('*:event', (event) => {
    useEventFunction(event)
  })

  useEvent('crazy:*', (event) => {
    useEventFunction(event)
  })
  useEvent('not-crazy:event', (event) => {
    useEventFunction(event)
  })

  return (
    <Workbook
      config={mockConfig}
      onRecordHooks={[
        [
          '**',
          (record) => {
            record.set('email', 'TEST SHEET RECORD')
            return record
          },
        ],
      ]}
      onSubmit={async (sheet) => {
        console.log('onSubmit', { sheet })
      }}
    />
  )
}

describe('useEvent', () => {
  beforeEach(() => {
    jest.mocked(useDeepCompareEffect).mockImplementation((callback, deps) => {
      React.useEffect(callback, deps)
    })
    jest.clearAllMocks()
  })

  it('registers plugins and handles events when provided', async () => {
    const useEventMock = jest.fn()

    render(
      <FlatfileProvider publishableKey="pk_123456">
        <APP useEventFunction={useEventMock} />
      </FlatfileProvider>
    )

    window.postMessage(
      {
        flatfileEvent: { topic: 'crazy:event', payload: { alex: 'rock' } },
      },
      '*'
    )

    await waitFor(() => {
      expect(useEventMock).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { alex: 'rock' } })
      )
      expect(useEventMock).toHaveBeenCalledTimes(3)
    })
  })

  // More tests to check interaction during onSubmit and other complex logic
})
