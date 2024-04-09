import React from 'react'
import { render } from '@testing-library/react'
import { Workbook } from '../Workbook'
import FlatfileContext, { FlatfileContextType } from '../FlatfileContext'
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
  createSpace: {
    document: undefined,
    workbook: {
      name: 'Embedded Workbook',
      sheets: [],
    },
    space: {
      name: 'Embedded Space',
      labels: ['embedded'],
      namespace: 'portal',
      metadata: {
        sidebarConfig: { showSidebar: false },
      },
    },
  },
  setCreateSpace: jest.fn(),
  updateSpace: jest.fn(),
}

jest.mock('../../utils/useDeepCompareEffect', () => ({
  useDeepCompareEffect: jest.fn(),
}))

const mockUpdateWorkbook = jest.fn()
const mockCreateSpace = {
  workbook: {
    sheets: [{ slug: 'test-sheet' }],
  },
}

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

// const APP = ({ useEventFunction }: { useEventFunction: any }) => {
//   const context = useContext(FlatfileContext)
//   useEffect(() => {
//     context.setAccessToken('sk_123456')
//   }, [])
//   // useEffect(() => {
//   //   console.log('APP useEffect')
//   //   // console.dir({ context }, { depth: null })
//   // }, [context])
//   // useEvent('**', (event) => {
//   //   console.log('APP useEvent', { event })
//   //   useEventFunction(event)
//   // })

//   return (
//     <Workbook
//       config={mockConfig}
//       onRecordHooks={[
//         [
//           'test-sheet',
//           (record, event) => {
//             console.log('APP onRecordHook!', { record, event })
//             useEventFunction(event)
//             record.set('email', 'TEST SHEET RECORD')
//             return record
//           },
//         ],
//       ]}
//       onSubmit={async (sheet) => {
//         console.log('onSubmit', { sheet })
//       }}
//     />
//   )
// }

describe('Workbook', () => {
  beforeEach(() => {
    jest.mocked(useDeepCompareEffect).mockImplementation((callback, deps) => {
      React.useEffect(callback, deps)
    })
    jest.clearAllMocks()
  })

  it('calls updateWorkbook with config on initial render', () => {
    render(
      <FlatfileContext.Provider
        value={{
          ...MockFlatfileProviderValue,
          updateWorkbook: mockUpdateWorkbook,
        }}
      >
        <Workbook config={mockConfig} />
      </FlatfileContext.Provider>
    )

    expect(mockUpdateWorkbook).toHaveBeenCalledWith(mockConfig)
  })

  it('calls updateWorkbook with updated config when onSubmit is provided', () => {
    const onSubmitMock = jest.fn()
    const updatedConfig = {
      ...mockConfig,
      actions: [workbookOnSubmitAction],
    }

    render(
      <FlatfileContext.Provider
        value={{
          ...MockFlatfileProviderValue,
          updateWorkbook: mockUpdateWorkbook,
        }}
      >
        <Workbook config={mockConfig} onSubmit={onSubmitMock} />
      </FlatfileContext.Provider>
    )

    expect(mockUpdateWorkbook).toHaveBeenCalledWith(updatedConfig)
  })

  // it('registers plugins and handles events when onRecordHooks are provided', async () => {
  //   const useEventMock = jest.fn()

  //   render(
  //     <FlatfileProvider publishableKey="pk_123456">
  //       <APP useEventFunction={useEventMock} />
  //     </FlatfileProvider>
  //   )

  //   window.postMessage(
  //     {
  //       flatfileEvent: {
  //         topic: 'commit:created',
  //         payload: { alex: 'rock', trackChanges: false },
  //         context: {
  //           commitId: 'us_vr_123456',
  //           sheetSlug: 'test-sheet',
  //         },
  //       },
  //     },
  //     '*'
  //   )

  //   // await sleep(3000)
  //   await waitFor(() => {
  //     expect(useEventMock).toHaveBeenCalled()
  //   })
  // })

  // More tests to check interaction during onSubmit and other complex logic
})
