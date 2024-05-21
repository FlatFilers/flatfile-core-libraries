import React from 'react'
import FlatfileContext from './FlatfileContext'
import { useCallback, useContext } from 'react'
import type { Flatfile } from '@flatfile/api'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'

type DocumentProps = {
  config: Flatfile.DocumentConfig
  defaultPage?: boolean
}
/**
 * `Document` component responsible for updating the document configuration within the Flatfile context.
 * It utilizes the `useDeepCompareEffect` hook to deeply compare the `config` prop changes and update the document accordingly.
 *
 * @component
 * @example
 * const documentConfig = {
 *   title: "Document Title",
 *   body: "Example Body",
 * }
 * return <Document config={documentConfig} />
 *
 * @param {DocumentProps} props - The props for the Document component.
 * @param {Flatfile.DocumentConfig} props.config - The configuration object for the document.
 */

export const Document = (props: DocumentProps) => {
  const { config, defaultPage } = props
  const { updateDocument, setDefaultPage } = useContext(FlatfileContext)

  useDeepCompareEffect(() => {
    updateDocument(config)
    if (defaultPage) {
      setDefaultPage({ document: config.title })
    }
  }, [config, defaultPage])

  return <></>
}
