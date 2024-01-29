import { IPayload } from './FlatfileRecord'

export class FlatfileSession {
  constructor(private payload: IPayload) {}

  get workspaceId() {
    return this.payload.workspaceId
  }

  get workbookId() {
    return this.payload.workbookId
  }

  get schemaId() {
    return this.payload.schemaId
  }

  get schemaSlug() {
    return this.payload.schemaSlug
  }

  get uploads() {
    return this.payload.uploads
  }

  get endUser() {
    return this.payload.endUser
  }

  get rows() {
    return this.payload.rows
  }

  get env() {
    return this.payload.env
  }

  get envSignature() {
    return this.payload.envSignature
  }
}
