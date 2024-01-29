import { ISpace } from '@flatfile/embedded-utils'
import React from 'react'

export type IReactInitSpaceProps = ISpace & {
  activated: boolean
  error?: (error: Error | string) => React.ReactNode
  loading?: React.ReactElement
}
