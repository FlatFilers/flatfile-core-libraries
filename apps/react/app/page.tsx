'use client'
import React from 'react'

import App from './App'
import { FlatfileProvider } from '@flatfile/react'

/**
 * @description Generates high-quality documentation for code given to it, using the
 * provided `PUBLISHABLE_KEY`. It returns a `FlatfileProvider` component that provides
 * the necessary publishable key and config options to preload the application.
 * 
 * @returns {HTML element} a Flatfile provider that renders the `App` component.
 * 
 * 	* `<FlatfileProvider>` is an React component that provides the Flatfile provider
 * for the App component.
 * 	* `publishableKey` is a prop passed to the FlatfileProvider, which contains the
 * publishable key used to sign the generated Flatfile.
 * 	* `config` is another prop passed to the FlatfileProvider, which contains an
 * object with two properties: `preload` and `styleSheetOptions`. The `preload`
 * property sets whether the component should preload the Flatfile at runtime, while
 * the `styleSheetOptions` property specifies a nonce value for the Flatfile.
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
