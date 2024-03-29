'use client'
import React from 'react'

import App from './App'
import { FlatfileProvider } from '@flatfile/react'

export default function Home() {
  const ACCESS_TOKEN = process.env.NEXT_PUBLIC_FLATFILE_API_KEY
  if (!ACCESS_TOKEN) return <>No ACCESS_TOKEN Available</>
  return (
    <FlatfileProvider
      accessToken={ACCESS_TOKEN}
      config={{
        preload: false,
        mountElement: 'example-mount-class',
      }}
    >
      <App />
    </FlatfileProvider>
  )
}
