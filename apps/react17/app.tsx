import {
  Document,
  FlatfileProvider,
  Sheet,
  Space,
  useFlatfile,
  useListener,
  Workbook,
} from '@flatfile/react'
import React, { useCallback } from 'react'
import { document } from './utils/document'
import { workbook } from './utils/workbook'

import { recordHook } from '@flatfile/plugin-record-hook'

const S: (props: any) => null = Sheet as any
const FP: (props: any) => null = FlatfileProvider as any

export default function App() {
  return (
    <FP key={'pk_aa746df15610411e9649124119d6ec4c'}>
      <Portal />
    </FP>
  )
}

function Portal() {
  const logClosed = useCallback(() => {
    console.log(`Flatfile Portal closed`)
  }, [])

  useListener((client) => {
    client.use(
      recordHook('contacts2', (record) => {
        const firstName = record.get('firstName')
        console.log({ firstName })

        record.set('lastName', 'Rocks')
        return record
      })
    )
  }, [])

  const { openPortal } = useFlatfile({ onClose: logClosed })

  return (
    <>
      <button onClick={openPortal}>Open Portal</button>
      <Space
        config={{
          name: "Alex's Space",
          metadata: {
            sidebarConfig: {
              showSidebar: true,
            },
          },
        }}
      >
        <Document defaultPage config={document} />
        <Workbook
          config={{
            ...workbook,
            name: "ALEX'S WORKBOOK",
          }}
          onSubmit={async (sheet) => {
            console.log('on Workbook Submit ', { sheet })
          }}
          onRecordHooks={[
            [
              (record) => {
                record.set('email', 'SHEET 1 RECORDHOOKS')
                return record
              },
            ],
            [
              (record) => {
                record.set('email', 'SHEET 2 RECORDHOOKS')
                return record
              },
            ],
          ]}
        >
          <S
            defaultPage
            config={{
              ...workbook.sheets![0],
              slug: 'contacts3',
              name: 'Contacts 3',
            }}
            onRecordHook={(record) => {
              record.set('email', 'SHEET 3 RECORDHOOK')
              return record
            }}
            onSubmit={async (sheet) => {
              console.log('onSubmit from Sheet 3', { sheet })
            }}
          />
          <S
            config={{
              ...workbook.sheets![0],
              slug: 'contacts4',
              name: 'Contacts 4',
            }}
            onRecordHook={(record) => {
              record.set('email', 'SHEET 4 RECORDHOOK')
              return record
            }}
            onSubmit={(sheet) => {
              console.log('onSubmit from Sheet 4', { sheet })
            }}
          />
        </Workbook>
      </Space>
    </>
  )
}
