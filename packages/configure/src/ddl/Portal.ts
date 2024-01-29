interface PortalOption {
  name: string
  sheet: string
  archived?: boolean
  helpContent?: string
}

export class Portal {
  public privateKeyString: string | undefined
  public id: string | undefined
  constructor(public readonly options: PortalOption) {}

  setId(id: string) {
    this.id = id
  }

  setPrivateKeyString(privateKeyString: string) {
    this.privateKeyString = privateKeyString
  }
}
