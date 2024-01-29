import { Agent } from '../ddl/Agent'

/**
 * Anything implementing this can be exported directly as a Flatfile X
 * agent. This is a convenience method so that you don't have to export the
 * full FlatfileConfig > SpaceConfig > WorkbookConfig > SheetConfig if you
 * only have one of these.
 */
export interface Mountable {
  /**
   * Generate and return a default FlatfileConfig stack.
   */
  mount(): Agent
}
