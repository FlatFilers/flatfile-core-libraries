import React, { useCallback, useContext } from 'react'
import type { Flatfile } from '@flatfile/api'
import FlatfileContext from './FlatfileContext'
import { useDeepCompareEffect } from '../utils/useDeepCompareEffect'

type SpaceProps = {
  id?: string
  config?: Flatfile.SpaceConfig
  children?: React.ReactNode
}

/**
 * `Space` component for integrating Flatfile's space functionality within a React application.
 * This component allows for the configuration of a Flatfile space and renders its children within the context of that space.
 *
 * @component
 * @example
 * const spaceConfig = {
 *   name: 'Example Space',
 *   metadata: {},
 * }
 *
 * <Space config={spaceConfig}>
 *   <Workbook config={workbookConfig}>
 *   <Document config={documentConfig}>
 * </Space>
 *
 * @param {SpaceProps} props - The properties passed to the Space component.
 * @param {string} [props.id] - Optional ID for the space component.
 * @param {Flatfile.SpaceConfig} props.config - Configuration object for the Flatfile space.
 * @param {React.ReactNode} [props.children] - Child components to be rendered within the Space component.
 * @returns {React.ReactElement} A React component that renders the Flatfile space.
 */

export const Space = (props: SpaceProps) => {
  const { config, id, children } = props
  const { updateSpace } = useContext(FlatfileContext)

  const callback = useCallback(() => {
    updateSpace({
      ...(config || {}),
      id,
    })
  }, [config, updateSpace])

  useDeepCompareEffect(callback, [config])

  return <>{children}</>
}
