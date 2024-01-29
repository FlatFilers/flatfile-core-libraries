import { ERecordStatus, FlatfileRecord } from './FlatfileRecord'
import { RecordMutation } from './RecordMutation'
import { DATA_RECORD_BASIC } from './data/basic'

describe('FlatfileRecord', () => {
  let record: FlatfileRecord
  beforeEach(() => {
    record = new FlatfileRecord(DATA_RECORD_BASIC)
  })

  test('.info returns only the info message', () => {
    expect(record.info.length).toBe(1)
    expect(record.info[0].field).toBe('full_name')
  })

  test('.errors returns only the error message', () => {
    expect(record.errors.length).toBe(1)
    expect(record.errors[0].field).toBe('zip_code')
  })

  test('.warnings returns only the warning message', () => {
    expect(record.warnings.length).toBe(1)
    expect(record.warnings[0].field).toBe('email')
  })

  test('.allMessages returns all messages', () => {
    expect(record.allMessages.length).toBe(3)
  })

  test('.status returns the right data', () => {
    expect(record.status).toBe(ERecordStatus.REVIEW)
  })

  test('.valid returns the right data', () => {
    expect(record.valid).toBe(true)
  })

  test('.data returns a key/value object', () => {
    expect(record.data).toEqual(DATA_RECORD_BASIC.data)
  })

  test('.recordId returns the numeric ID', () => {
    expect(record.recordId).toEqual(9)
  })

  test('.getMutation prepares and returns a mutation object', () => {
    expect(record.getMutation()).toBeInstanceOf(RecordMutation)
    expect(record.getMutation().recordId).toBe(9)
  })
})
