import { EventHandler } from '../utils/event.handler'

export class Role extends EventHandler implements RoleOptions {
  /**
   * User-friendly group name
   *
   * @example Administrators
   */
  public readonly name: string

  /**
   * User facing description
   */
  public readonly description?: string

  constructor({ name, description }: RoleOptions) {
    super()

    this.name = name
    this.description = description
  }

  getEventTargetName(slug: string): string {
    return `role(${slug})`
  }
}

interface RoleOptions {
  name: string
  description?: string
}
