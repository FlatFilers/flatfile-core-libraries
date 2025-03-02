import { ReactNode } from 'react'
import { IFrameTypes } from './iFrameProps'

export type Exclusive<T, U> =
  | (T & Partial<Record<Exclude<keyof U, keyof T>, never>>)
  | (U & Partial<Record<Exclude<keyof T, keyof U>, never>>)

export interface BaseSpace {
  children: ReactNode
  environmentId?: string
  apiUrl?: string
  config?: IFrameTypes
}

export interface CreateSpaceWithPublishableKey extends BaseSpace {
  publishableKey: string
}

export interface ReusedSpace extends BaseSpace {
  accessToken: string
}

// Use the Exclusive type for your props
export type ExclusiveFlatfileProviderProps = Exclusive<
  CreateSpaceWithPublishableKey,
  ReusedSpace
>
