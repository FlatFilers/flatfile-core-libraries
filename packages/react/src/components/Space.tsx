import React, { useCallback, useContext } from 'react'
import type { Flatfile } from '@flatfile/api'
import FlatfileContext from './FlatfileContext'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'

type SpaceProps = {
  id?: string
  config: Flatfile.SpaceConfig
  children?: React.ReactNode
}

/**
 * @name Space
 * @description Flatfile Embedded Space component
 * @param props
 */
export const Space = (props: SpaceProps) => {
  const { config, children } = props
  const { updateSpace } = useContext(FlatfileContext)

  const callback = useCallback(() => {
    updateSpace(config)
  }, [config, updateSpace])

  useDeepCompareEffect(callback, [config])

  return <>{children}</>
}
