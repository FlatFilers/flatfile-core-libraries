import EndUserObject from '../types/obj.end-user'
import FileObject from '../types/obj.file'
import { BaseMeta } from '../types/obj.meta'

/**
 * A stub interface for legacy metadata
 */
export class Meta implements BaseMeta {
  get batchID(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get endUser(): EndUserObject {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get status(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get originalFile(): FileObject | null {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get csvFile(): FileObject | null {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get filename(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get filetype(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get managed(): boolean {
    return true
  }
  get manual(): boolean {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get config(): object {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get parsing_config(): object {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get count_rows(): number {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get count_rows_accepted(): number {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get count_columns(): number {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get count_columns_matched(): number {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get skipped_rows(): number {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get headers_raw(): Array<object> | null {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get headers_matched(): Array<object> | null {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get custom_columns(): Array<object> {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get failure_reason(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get submitted_at(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get failed_at(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get created_at(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get handled_at(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get matched_at(): string {
    throw new Error('meta is no longer accessible in Platform 1.0')
  }
  get inChunks(): boolean {
    return false
  }
}
