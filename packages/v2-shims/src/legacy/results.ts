import RecordObject from '../types/record.object'
import Stats from './stats'
import EndUser from './user'
import UploadFile from './upload.file'
import { Meta } from './meta'

export default class FlatfileResults {
  /**
   * Information about the import
   */
  private readonly $meta: Meta

  /**
   * Raw data output from the importer
   */
  private readonly $data: Array<RecordObject>

  /**
   * Instance of importer used to manage this file
   */
  private get $importer(): any {
    throw new Error('You cannot use this property in the Flatfile Platform')
  }

  constructor(data: Array<RecordObject>, meta: Meta) {
    this.$meta = meta
    this.$data = data
  }

  /**
   * The raw output from the importer including all deleted rows
   * and sequence info
   */
  get rawOutput(): Array<RecordObject> {
    return this.blobOnly(this.$data, 'rawOutput')
  }

  /**
   * An array of valid data, key-mapped to the configuration provided
   * (alias of validData)
   */
  get data(): Array<any> {
    return this.blobOnly(this.validData, 'data')
  }

  /**
   * An array of valid data, key-mapped to the configuration provided
   */
  get validData(): Array<any> {
    const res = this.$data
      .filter((v) => v.valid)
      .filter((v) => !v.deleted)
      .map((v) => v.data)
    return this.blobOnly(res, 'validData')
  }

  /**
   * Rows of data the user excluded from the final results,
   * key-mapped to the configuration provided
   */
  get deletedData(): Array<any> {
    const res = this.$data.filter((v) => v.deleted).map((v) => v.data)
    return this.blobOnly(res, 'deletedData')
  }

  /**
   * All data from the original file upload including deleted rows,
   * key-mapped to the configuration provided
   */
  get allData(): Array<any> {
    return this.blobOnly(
      this.$data.map((v) => v.data),
      'allData'
    )
  }

  /**
   * The uuid of the batch assigned by Flatfile (use this in internal
   * references for support purposes)
   */
  get batchId(): string {
    return this.$meta.batchID
  }

  /**
   * Stats and counts about this file upload
   */
  get stats(): Stats {
    return new Stats(this.$meta)
  }

  /**
   * The customer provided in setCustomer
   */
  get customer(): EndUser | null {
    if (this.$meta.endUser) {
      return new EndUser(this.$meta.endUser)
    }
    return null
  }

  /**
   * A File object of the originally uploaded file stored as an AWS url
   */
  get originalFile(): UploadFile | null {
    if (this.$meta.originalFile) {
      return new UploadFile(this.$meta.originalFile)
    }
    return null
  }

  /**
   * Same as originalFile unless it was uploaded in xls format, in which case this is the converted csv file stored as an AWS url
   */
  get csvFile(): UploadFile | null {
    if (this.$meta.originalFile) {
      if (this.$meta.originalFile.filetype === 'csv') {
        return new UploadFile(this.$meta.originalFile)
      } else {
        if (this.$meta.csvFile) {
          return new UploadFile(this.$meta.csvFile)
        }
      }
    }
    return null
  }

  /**
   * The filename of the originally uploaded file
   */
  get fileName(): string | null {
    return this.$meta.filename || null
  }

  /**
   * If the final upload is managed by a private endpoint or not
   */
  get managed(): boolean {
    return this.$meta.managed || false
  }

  /**
   * If the data was entered manually instead of via file upload or not
   */
  get manual(): boolean {
    return this.$meta.manual
  }

  /**
   * The parsed and bootstrapped config object used by this importer instance
   */
  get config(): object {
    return this.$meta.config
  }

  /**
   * The configuration used by the csv parser PapaParse: https://www.papaparse.com/docs#config
   */
  get parsingConfig(): object {
    return this.$meta.parsing_config
  }

  /**
   * The invalid rows that were skipped on submission
   */
  get skippedRows(): number | null {
    return this.$meta.skipped_rows || null
  }

  /**
   * The headers before they were matched as given in the original file
   */
  get headersRaw(): Array<object> | null {
    return this.$meta.headers_raw || null
  }

  /**
   * The headers after they are matched
   */
  get headersMatched(): Array<object> | null {
    return this.$meta.headers_matched || null
  }

  /**
   * Get the next chunk of records
   */
  nextChunk(): Promise<null | any> {
    throw new Error(
      'You cannot use nextChunk() with the v2 shim for the Flatfile Platform'
    )
  }

  /**
   * An array of any columns that were created during import
   */
  get customColumns(): Array<object> {
    return this.$meta.custom_columns
  }

  /**
   * The reason for the failure if there was a failure
   */
  get failureReason(): string | null {
    return this.$meta.failure_reason || null
  }

  /**
   * The time that the data was submitted
   */
  get submittedAt(): string | null {
    return this.$meta.submitted_at || null
  }

  /**
   * The time that the import failed if it failed
   */
  get failedAt(): string | null {
    return this.$meta.failed_at || null
  }

  /**
   * The time the data began the import, whether via file upload or manual data entry
   */
  get createdAt(): string {
    return this.$meta.created_at
  }

  private blobOnly<T>(v: T, method: string, alt = 'nextChunk()'): T {
    if (this.$meta.inChunks) {
      throw new Error(
        `"${method}" is not accessible when using "inChunks". Please see docs for "${alt}" instead.`
      )
    }
    return v
  }
}
