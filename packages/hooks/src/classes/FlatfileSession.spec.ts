import { IPayload, IRawRecord } from './FlatfileRecord'
import { FlatfileSession } from './FlatfileSession'

const rawRecords: IRawRecord[] = [
  {
    rawData: { name: 'Dog', age: 12 },
    rowId: 0,
  },
  {
    rawData: { name: 'Cat', age: 24 },
    rowId: 1,
  },
]

const sample: IPayload = {
  schemaSlug: 'slug',
  workspaceId: '123abc',
  workbookId: '345def',
  schemaId: 1010,
  uploads: ['upload1', 'upload2'],
  endUser: 'jared',
  env: { secret: 'secret' },
  envSignature: 'signature',
  rows: rawRecords,
}

describe('FlatfileSession', () => {
  let session: FlatfileSession

  beforeEach(() => {
    session = new FlatfileSession(sample)
  })

  it('should return a workspaceId', () => {
    expect(session.workspaceId).toBe(sample.workspaceId)
  })

  it('should return a workbookId', () => {
    expect(session.workbookId).toBe(sample.workbookId)
  })

  it('should return a schemaId', () => {
    expect(session.schemaId).toBe(sample.schemaId)
  })

  it('should return uploads', () => {
    expect(session.uploads).toEqual(sample.uploads)
  })

  it('should return endUser', () => {
    expect(session.endUser).toBe(sample.endUser)
  })

  it('should return rows', () => {
    expect(session.rows).toEqual(rawRecords)
  })

  it('should return env', () => {
    expect(session.env).toEqual(sample.env)
  })

  it('should return envSignature', () => {
    expect(session.envSignature).toBe(sample.envSignature)
  })

  it('should return schemaSlug', () => {
    expect(session.schemaSlug).toBe(sample.schemaSlug)
  })
})
