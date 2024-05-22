type DocumentDefaultPage = { document: string }
type WorkbookDefaultPage = { workbook: string }
type SheetDefaultPage = { workbook: { sheet: string } }

type XOR<T, U> = T | U extends object
  ?
      | (T & Partial<U> & Partial<Record<Exclude<keyof U, keyof T>, never>>)
      | (U & Partial<T> & Partial<Record<Exclude<keyof T, keyof U>, never>>)
  : T | U

export type DefaultPageType = XOR<
  SheetDefaultPage | WorkbookDefaultPage,
  DocumentDefaultPage
>