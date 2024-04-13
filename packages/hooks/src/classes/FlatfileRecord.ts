import { digSet } from './utils'

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
  metadata?: Object
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
  config?: Record<string, any>
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
  private readonly metadata: Object
  private readonly mutated: M
  private readonly _rowId: number | string
  private _info: IRecordInfo<M>[] = []
  public _config: Record<string, any> = {}

  constructor(raw: IRawRecord) {
    this.mutated = Object.assign({}, raw.rawData) as M
    this.data = Object.assign({}, raw.rawData) as M
    this.metadata = Object.assign({}, raw.metadata)
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

  /**
   * Make the entire record or specific fields readonly by a user.
   *
   * @example ```js
   * record.setReadOnly() // make entire record readonly
   * ```
   *
   * @example ```js
   * record.setReadOnly('firstname', 'lastname') // make two fields readonly
   * ```
   * @param fields
   */
  setReadOnly(...fields: string[]) {
    if (!fields.length) {
      this._config = digSet(this._config, true, 'readonly')
    }
    fields.forEach((field) => {
      this._config = digSet(this._config, true, 'fields', field, 'readonly')
    })
  }

  /**
   * Make the entire record or specific fields writable by a user.
   *
   * @example ```js
   * record.setWritable() // make entire record writable
   * ```
   *
   * @example ```js
   * record.setWritable('firstname', 'lastname') // make two fields writable
   * ```
   * @param fields
   */
  setWritable(...fields: string[]) {
    if (!fields.length) {
      this._config = digSet(this._config, false, 'readonly')
    }
    fields.forEach((field) => {
      this._config = digSet(this._config, false, 'fields', field, 'readonly')
    })
  }

  /**
   * Return the current state of the record as simple key value pairs.
   */
  get obj(): Record<string, TPrimitive> {
    return Object.fromEntries(
      Object.entries(this.mutated).map(([key, value]) => [
        key,
        typeof value === 'object' && value && 'value' in value
          ? value.value
          : value,
      ])
    )
  }

  private verifyField(field: string, data?: object): boolean {
    return propExists(data || this.data, field)
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
      console.error(`Record does not have field "${field}".`)
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

  public setMetadata(data: Object) {
    Object.defineProperty(this, 'metadata', { value: data })
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

  public getMetadata(): Object {
    return this.metadata
  }

  public getLinks(field: string): TRecordData<TPrimitive>[] | null {
    if (this.verifyField(field)) {
      const fieldValue = this.mutated[field]
      if (fieldValue && typeof fieldValue === 'object') {
        const { links } = fieldValue
        if (links) {
          return links
        }
      }
    }
    console.error('Field has no links.')

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

  public compute(
    field: string,
    transformation: (
      value: TPrimitive,
      record: FlatfileRecord<M>
    ) => TPrimitive,
    message?: string
  ): this {
    this.set(field, transformation(this.get(field), this))
    if (message) {
      this.addComment(field, message)
    }
    return this
  }

  public computeIfPresent(
    field: string,
    transformation: (
      value: TPrimitive,
      record: FlatfileRecord<M>
    ) => TPrimitive,
    message?: string
  ): this {
    if (this.get(field)) {
      this.compute(field, transformation, message)
    }
    return this
  }

  public validate(
    field: string,
    validator: (value: TPrimitive, record: FlatfileRecord<M>) => boolean,
    message: string
  ): this {
    if (!validator(this.get(field), this)) {
      this.addError(field, message)
    }
    return this
  }

  public toJSON(): IRawRecordWithInfo<M> {
    return {
      row: {
        rawData: this.mutated,
        rowId: this.rowId,
        metadata: this.metadata,
      },
      config: this._config,
      info: this._info,
    }
  }
}
