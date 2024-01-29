import { IPrimitive, Nullable } from './general.interface'

export default interface IValidationResponse {
  /**
   * A string referencing the key affected by the problem
   */
  key: string

  /**
   * The validation error message
   */
  message: string

  /**
   * The type of validation response - currently only 'error' is supported
   */
  level?: 'error'
}

export type IDataHookResponse = Record<
  string,
  IDataHookRecord | Nullable<IPrimitive>
>

export interface IDataHookRecord {
  value?: string | boolean | number
  info?: IDataHookInfo[]
}

export interface IDataHookInfo {
  message: string
  level?: 'error' | 'warning' | 'info'
}
