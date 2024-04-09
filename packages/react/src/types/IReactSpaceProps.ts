import React from 'react'
import { ISpace } from '@flatfile/embedded-utils'
import { Flatfile } from '@flatfile/api'

export type IReactSpaceProps = ISpace & {
  error?: (error: Error | string) => React.ReactElement
  loading?: React.ReactElement
  sheets?: Flatfile.SheetConfig
}
