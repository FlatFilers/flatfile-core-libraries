'use client'

import { FlatfileProvider } from '@flatfile/react'
import App from './App'

export default function Home() {
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_FLATFILE_PUBLISHABLE_KEY
  if (!PUBLISHABLE_KEY) {
    return <>No Publishable Key Available</>
  }
  return (
    <>
      <FlatfileProvider
        publishableKey={PUBLISHABLE_KEY}
        config={{
          preload: true,
          styleSheetOptions: { nonce: 'flatfile-abc123' },
        }}
      >
        <App id="1" />
      </FlatfileProvider>
      <FlatfileProvider
        publishableKey={PUBLISHABLE_KEY}
        config={{
          preload: true,
          styleSheetOptions: { nonce: 'flatfile-abc123' },
        }}
      >
        <App id="2" />
      </FlatfileProvider>
    </>
  )
}
