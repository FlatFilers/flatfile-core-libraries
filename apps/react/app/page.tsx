'use client'
import React from 'react'

import App from './App'
import { FlatfileProvider } from '@flatfile/react'

/**
 * @description Generates high-quality documentation for given code and publishes it
 * to Flatfile, using the specified `publishableKey`.
 * 
 * @returns {HTML document} a functional component that uses a `FlatfileProvider` to
 * load a Next.js app with a preloaded configuration.
 * 
 * 	* `<FlatfileProvider>`: This component is a wrapping container for Flatfile, which
 * is a module that provides a simple way to store and retrieve data in a flat file.
 * The `publishableKey` attribute within the `config` object is used to specify the
 * publishable key for the Flatfile module.
 * 	* `App`: This is the component that will be rendered inside the `FlatfileProvider`.
 * It is likely that this component contains some of the logic and styling for the
 * application being developed.
 */
export default function Home() {
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_FLATFILE_PUBLISHABLE_KEY
  if (!PUBLISHABLE_KEY) return <>No Publishable Key Available</>
  return (
    <FlatfileProvider
      publishableKey={PUBLISHABLE_KEY}
      config={{
        preload: true,
        styleSheetOptions: { nonce: 'flatfile-abc123' },
      }}
    >
      <App />
    </FlatfileProvider>
  )
}
