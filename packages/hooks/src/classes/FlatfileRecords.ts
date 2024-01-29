import {
  IRawRecord,
  TRecordDataWithLinks,
  FlatfileRecord,
} from './FlatfileRecord'

export class FlatfileRecords<M extends TRecordDataWithLinks> {
  private readonly _records: FlatfileRecord<M>[]

  constructor(rawRecords: IRawRecord[]) {
    this._records = rawRecords.map(
      (rawRecord: IRawRecord) => new FlatfileRecord<M>(rawRecord)
    )
  }

  get records(): FlatfileRecord<M>[] {
    return this._records
  }

  public toJSON() {
    return this.records.map((record) => record.toJSON())
  }
}
