import React from 'react'
import { SimpleOnboarding } from '@flatfile/embedded-utils'

export type IReactSimpleOnboarding = SimpleOnboarding & {
  error?: (error: Error | string) => React.ReactElement
  loading?: React.ReactElement
}
