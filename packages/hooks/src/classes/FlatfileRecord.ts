export type TPrimitive = string | boolean | number | null

export type TRecordDataWithLinks<
  T extends TPrimitive | undefined = TPrimitive
> = {
  [key: string]: T | { value: T; links: TRecordData<TPrimitive>[] }
}

export type TRecordData<T extends TPrimitive | undefined = TPrimitive> = {
  [key: string]: T
}

export interface IRawRecord {
  rawData: TRecordDataWithLinks
  rowId: number | string
}

const propExists = (obj: object, prop: string) =>
  Object.prototype.hasOwnProperty.call(obj, prop)

export type TRecordInfoLevel = 'error' | 'warn' | 'info'
export type TRecordStageLevel =
  | 'cast'
  | 'empty'
  | 'required'
  | 'compute'
  | 'validate'
  | 'apply'
  | 'other'
export interface IRecordInfo<
  M extends TRecordDataWithLinks = TRecordDataWithLinks,
  K = keyof M
> {
  level: TRecordInfoLevel
  field: K
  message: string
  stage: TRecordStageLevel
}

export interface IRawRecordWithInfo<
  M extends TRecordDataWithLinks = TRecordDataWithLinks
> {
  row: IRawRecord
  info: IRecordInfo<M>[]
}

export interface IPayload {
  workspaceId: string
  workbookId: string
  schemaId: number
  schemaSlug: string
  uploads: string[]
  endUser?: any // TODO
  env?: Record<string, string | boolean | number>
  envSignature?: string
  rows: IRawRecord[]
}

export class FlatfileRecord<
  M extends TRecordDataWithLinks = TRecordDataWithLinks
> {
  private readonly data: M
  private readonly mutated: M
  private readonly _rowId: number | string
  private _info: IRecordInfo<M>[] = []

  constructor(raw: IRawRecord) {
    this.mutated = Object.assign({}, raw.rawData) as M
    this.data = Object.assign({}, raw.rawData) as M
    this._rowId = raw.rowId
    // this.links = new FlatfileRecords(raw.links)
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

  private verifyField(field: string, data?: object): boolean {
    if (!propExists(data || this.data, field)) {
      // TODO: make sure user's aware of this message
      console.error(`Record does not have field "${field}".`)
      return false
    }
    return true
  }

  private isLinkedField(field: string) {
    const fieldValue = this.mutated[field]
    return (
      !!fieldValue &&
      typeof fieldValue === 'object' &&
      propExists(fieldValue, 'value') &&
      propExists(fieldValue, 'links')
    )
  }

  public set(field: string, value: TPrimitive) {
    if (!this.verifyField(field)) {
      return this
    }
    const isLinked = this.isLinkedField(field)
    // check if X Reference field otherwise just set value
    if (isLinked) {
      const fieldValue = this.mutated[field]
      if (
        !!fieldValue &&
        typeof fieldValue === 'object' &&
        propExists(fieldValue, 'value') &&
        fieldValue.value === value
      ) {
        // if the value of the reference field is the same as the value we're trying to set, keep links and don't set value
        return
      } else {
        // if the value of the reference field is different than the value we're trying to set, remove links and set value
        Object.defineProperty(this.mutated, field, {
          value: {
            value: value,
          },
        })
      }
    } else {
      Object.defineProperty(this.mutated, field, {
        value,
      })
    }

    return this
  }

  public setLinkedValue(
    linkedFieldKey: string,
    childKey: string,
    value: TPrimitive
  ) {
    if (!this.verifyField(linkedFieldKey)) {
      return this
    }
    Object.assign(this.mutated, { [`${linkedFieldKey}::${childKey}`]: value })
    return this
  }

  public get(field: string): null | TPrimitive {
    if (this.verifyField(field)) {
      const value = this.mutated[field]

      if (!!value && typeof value === 'object' && propExists(value, 'value')) {
        return value.value
      }
      return value as TPrimitive
    }

    return null
  }

  public getLinks(field: string): any {
    if (this.verifyField(field)) {
      const fieldValue = this.mutated[field]
      if (!fieldValue) return null

      if (typeof fieldValue === 'object') {
        const { links } = fieldValue
        if (!links) {
          console.error('Field is has no links.')
          return null
        }
        return links
      } else if (typeof fieldValue === 'string') {
        console.error('Field is not a ReferenceField.')
        return fieldValue
      }
    }

    return null
  }

  public getLinkedValue(linkedFieldKey: string, childKey: string) {
    if (this.verifyField(linkedFieldKey)) {
      return this.mutated[`${linkedFieldKey}::${childKey}`] ?? null
    }

    return null
  }

  public addInfo(fields: string | string[], message: string): this {
    return this.pushInfoMessage(fields, message, 'info', 'other')
  }

  /**
   * @alias addInfo
   */
  public addComment(fields: string | string[], message: string): this {
    return this.addInfo(fields, message)
  }

  public addError(fields: string | string[], message: string): this {
    return this.pushInfoMessage(fields, message, 'error', 'other')
  }

  public addWarning(fields: string | string[], message: string) {
    return this.pushInfoMessage(fields, message, 'warn', 'other')
  }

  public pushInfoMessage(
    fields: string | string[],
    message: string,
    level: IRecordInfo['level'],
    stage: TRecordStageLevel
  ): this {
    fields = Array.isArray(fields) ? fields : [fields]

    fields.forEach((field) => {
      if (this.verifyField(field)) {
        this._info.push({
          field,
          message,
          level,
          stage,
        })
      }
    })
    return this
  }

  public toJSON(): IRawRecordWithInfo<M> {
    return {
      row: {
        rawData: this.mutated,
        rowId: this.rowId,
      },
      info: this._info,
    }
  }
}
