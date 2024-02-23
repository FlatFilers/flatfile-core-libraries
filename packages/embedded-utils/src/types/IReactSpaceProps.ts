import React from 'react'
import { ISpace } from './Space'

export type IReactSpaceProps = ISpace & {
  error?: (error: Error | string) => React.ReactElement
  loading?: React.ReactElement
}