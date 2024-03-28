import React from 'react'
import FlatfileContext from './FlatfileContext'
import { useCallback, useContext } from 'react'
import type { Flatfile } from '@flatfile/api'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'

export const Document = (props: { config: Flatfile.DocumentConfig }) => {
  const { config } = props
  const { updateDocument } = useContext(FlatfileContext)

  const callback = useCallback(() => {
    updateDocument(config)
  }, [config, updateDocument])

  useDeepCompareEffect(callback, [config])

  return <></>
}
