import FlatfileContext from './FlatfileContext'
import React, { useCallback, useContext, useEffect, useRef } from 'react'
import type { Flatfile } from '@flatfile/api'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'

export const Document = (props: {
  config: Flatfile.DocumentConfig
  children?: React.ReactNode
}) => {
  const { config, children } = props
  const { updateDocument } = useContext(FlatfileContext)

  const callback = useCallback(() => {
    updateDocument(config)
  }, [config, updateDocument])

  useDeepCompareEffect(callback, [config])

  return null
}
