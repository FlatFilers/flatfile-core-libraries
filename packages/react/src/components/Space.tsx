import FlatfileContext from './FlatfileContext'
import React, { useCallback, useContext } from 'react'
import type { Flatfile } from '@flatfile/api'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'

export const Space = (props: {
  config: Flatfile.SpaceConfig & { id?: string }
  children?: React.ReactNode
}) => {
  const { config, children } = props
  const { updateSpace, createSpace } = useContext(FlatfileContext)

  const callback = useCallback(() => {
    updateSpace(config)
  }, [config, updateSpace])

  useDeepCompareEffect(callback, [config])

  return <>{children}</>
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
