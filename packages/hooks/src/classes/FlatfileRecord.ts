import {
  IRawRecord,
  IRawRecordWithInfo,
  IRecordInfo,
  TPrimitive,
  TRecordData,
} from '../types/Record'

export class FlatfileRecord {
  private readonly data: TRecordData
  private readonly mutated: TRecordData
  private readonly _rowId: number
  private _info: IRecordInfo[] = []

  constructor(raw: IRawRecord) {
    this.mutated = Object.assign({}, raw.rawData)
    this.data = Object.assign({}, raw.rawData)
    this._rowId = raw.rowId
  }

  get rowId() {
    return this._rowId
  }

  get originalValue() {
    return this.data
  }

  get value() {
    return this.mutated
  }

  private verifyField(field: string): boolean {
    if (!this.data.hasOwnProperty(field)) {
      // TODO: make sure user's aware of this message
      console.error(`Record does not have field "${field}".`)
      return false
    }
    return true
  }

  public set(field: string, value: TPrimitive) {
    if (!this.verifyField(field)) {
      return this
    }

    Object.defineProperty(this.mutated, field, {
      value,
    })

    return this
  }

  public get(field: string): null | TPrimitive {
    if (this.verifyField(field)) {
      return this.mutated[field]
    }

    return null
  }

  public addInfo(fields: string | string[], message: string): this {
    return this.pushInfoMessage(fields, message, 'info')
  }

  /**
   * @alias addInfo
   */
  public addComment(fields: string | string[], message: string): this {
    return this.addInfo(fields, message)
  }

  public addError(fields: string | string[], message: string): this {
    return this.pushInfoMessage(fields, message, 'error')
  }

  public addWarning(fields: string | string[], message: string) {
    return this.pushInfoMessage(fields, message, 'warn')
  }

  private pushInfoMessage(
    fields: string | string[],
    message: string,
    level: IRecordInfo['level']
  ): this {
    fields = Array.isArray(fields) ? fields : [fields]

    fields.forEach((field) => {
      if (this.verifyField(field)) {
        this._info.push({
          field,
          message,
          level,
        })
      }
    })
    return this
  }

  public toJSON(): IRawRecordWithInfo {
    return {
      row: {
        rawData: this.mutated,
        rowId: this.rowId,
      },
      info: this._info,
    }
  }
}
