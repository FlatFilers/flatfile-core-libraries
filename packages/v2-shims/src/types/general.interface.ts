export type ScalarDictionary = IDictionary<Nullable<IPrimitive>>
export type IPrimitiveDictionary = IDictionary<IPrimitive>

export interface IDictionary<V = string> {
  [key: string]: V
}

export interface ICellStyles {
  bold?: boolean
  italic?: boolean
  strike?: boolean
}

export interface IValidationResponse {
  key: string
  message: string
  level?: IWarningLevel
}

type IWarningLevel = 'error' | 'warning' | 'info'

export type IPrimitive = string | number | boolean
export type Nullable<T> = T | undefined | null

export interface ILegacyMeta {
  batchID: string
  endUser?: any

  filename?: string
  filetype?: string
  managed: boolean
  manual: boolean

  devMode: boolean

  count_rows?: number
  count_rows_accepted?: number
  count_columns?: number
  count_columns_matched?: number

  category_field_map?: IDictionary<IDictionary<Nullable<IPrimitive>>>

  headers_raw?: IRawHeader[]
  headers_matched?: IHeaderMatched[]

  failure_reason?: string

  created_at: string
  matched_at?: string
  submitted_at?: string
  handled_at?: string
  failed_at?: string

  stylesheet?: IDictionary<ICellStyles>
}

export interface IRawHeader {
  index: number
  letter: string
  value?: string
}

export interface IHeaderMatched {
  index: number
  letter: string
  value?: string
  matched_key: string
}

export type Scalar = Nullable<IPrimitive>

export type MaybePromise<T> = T | Promise<T>
