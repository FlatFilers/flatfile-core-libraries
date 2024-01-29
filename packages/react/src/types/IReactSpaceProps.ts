import React from 'react'
import { ISpace } from '@flatfile/embedded-utils'

export type IReactSpaceProps = ISpace & {
  error?: (error: Error | string) => React.ReactElement
  loading?: React.ReactElement
}
