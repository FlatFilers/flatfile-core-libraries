'use client'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { FlatFilePlatform } from './FlatfilePlatform'
import {
  ClickableComponent,
  useListner,
  useWorkbook,
} from './upload-components'
import { FlatfileProvider } from '@flatfile/react'
import { version as ReactVersion } from 'react'

export const App = ({ PUBLISHABLE_KEY }: { PUBLISHABLE_KEY: string }) => {
  console.log('APP APP APP')
  const listener = useListner()
  console.log({ listener })
  const workbook = useWorkbook()
  return (
    <FlatfileProvider publishableKey={PUBLISHABLE_KEY}>
      <div>
        <h1>Hello from React {ReactVersion}</h1>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Flatfile Platform</h1>
      <FlatFilePlatform
        listener={listener}
        workbook={workbook}
        ActionComponent={ClickableComponent}
      />
    </FlatfileProvider>
  )
}
