'use client'
import React from 'react'

import App from './App'
import { FlatfileProvider } from '@flatfile/react'

export default function Home() {
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_FLATFILE_PUBLISHABLE_KEY
  if (!PUBLISHABLE_KEY) return <>No Publishable Key Available</>
  return (
    <FlatfileProvider
      publishableKey={PUBLISHABLE_KEY}
      config={{
        mountElement: 'example-mount-class',
        preload: true
      }}
    >
      <App />
    </FlatfileProvider>
  )
}
