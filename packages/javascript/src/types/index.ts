export * from './InitialResourceData'
export * from './UpdateSpaceInfo'

import { ISpace, SimpleOnboarding } from '@flatfile/embedded-utils'

export interface SimpleListenerType
  extends Pick<
    SimpleOnboarding,
    'onRecordHook' | 'onSubmit' | 'submitSettings'
  > {
  slug: string
}

export type InitSpaceType = ISpace & {
  isAutoConfig: boolean
}
