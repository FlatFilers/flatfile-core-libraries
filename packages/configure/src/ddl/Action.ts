import { Action as ActionOptions } from '@flatfile/blueprint'
import { FlatfileEvent } from '../utils/flatfile.event'

export class Action {
  public readonly slug?: string
  public readonly label: string
  public readonly options: ActionOptions

  constructor(
    public readonly nameOrOptions: string | ActionOptions,
    public readonly handler: (
      event: FlatfileEvent,
      options: ActionOptions
    ) => void
  ) {
    if (typeof nameOrOptions === 'string') {
      this.slug = nameOrOptions
      this.label = nameOrOptions
      this.options = {
        slug: nameOrOptions,
        label: nameOrOptions,
      }
    } else {
      this.slug = nameOrOptions.slug
      this.label =
        nameOrOptions.label ||
        nameOrOptions.slug ||
        nameOrOptions.operation ||
        'Unknown Action'
      this.options = nameOrOptions
    }
    this.handler = handler
  }
}
