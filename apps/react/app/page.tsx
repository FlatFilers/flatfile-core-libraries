'use client'

import { FlatfileProvider } from '@flatfile/react'
import App from './App'

export default function Home() {
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_FLATFILE_PUBLISHABLE_KEY
  const spaceUrl = process.env.NEXT_PUBLIC_FLATFILE_SPACE_URL || 'https://platform.flatfile.com/s'
  const apiUrl = process.env.NEXT_PUBLIC_FLATFILE_API_URL || 'https://platform.flatfile.com/api'
  if (!PUBLISHABLE_KEY) {
    return <>No Publishable Key Available</>
  }
  return (
    <FlatfileProvider
      publishableKey={PUBLISHABLE_KEY}
      config={{
        preload: true,
        spaceUrl,
      }}
      apiUrl={apiUrl}
      externalActorId="test-1"
    >
      <App id="1" />
    </FlatfileProvider>
  )
}
