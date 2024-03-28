import { EmbeddedIFrameWrapper } from './EmbeddedIFrameWrapper'
import { IFrameTypes } from '../types'
import FlatfileContext from './FlatfileContext'
import React, { useContext, useEffect } from 'react'
import type { Flatfile } from '@flatfile/api'

export const Workbook = (
  props: {
    workbook: Flatfile.CreateWorkbookConfig
    document?: Flatfile.DocumentConfig
  } & IFrameTypes
) => {
  const { workbook, document, ...workbookProps } = props
  const {
    sessionSpace,
    setOpen,
    flatfileConfiguration,
    setFlatfileConfiguration,
  } = useContext(FlatfileContext)

  useEffect(() => {
    setFlatfileConfiguration({
      ...flatfileConfiguration,
      workbook,
      document,
    })
  }, [workbook, document])

  if (sessionSpace) {
    return (
      <EmbeddedIFrameWrapper
        handleCloseInstance={() => setOpen(false)}
        {...sessionSpace}
        {...workbookProps}
      />
    )
  }
}

// Example Usage:
// const App = () => {
//   useListener((client) => {
//     client.on('**', (event) => {
//       console.log('App useListener Event => ', event.topic)
//     })
//   }, [])
//   return <Workbook workbook={workbook} />
// }

// const Main = () => {
//   return (
//     <FlatfileProvider publishableKey={PUBLISHABLE_KEY}>
//       <App />
//     </FlatfileProvider>
//   )
// }
