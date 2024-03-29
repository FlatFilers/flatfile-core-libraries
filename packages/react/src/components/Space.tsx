import FlatfileContext from './FlatfileContext'
import React, { useCallback, useContext } from 'react'
import type { Flatfile } from '@flatfile/api'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'

/**
 * @name Space
 * @description Flatfile Embedded SpaceWrapper component 
 * @param props
 */

export const Space = (props: {
  config: Flatfile.SpaceConfig & { id?: string }
  children?: React.ReactNode
}) => {
  const { config, children } = props
  const { updateSpace, createSpace } = useContext(FlatfileContext)

  const callback = useCallback(() => {
    updateSpace(config)
  }, [config, updateSpace])

  useDeepCompareEffect(callback, [config])

  return <>{children}</>
}
