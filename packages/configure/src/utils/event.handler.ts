import wildMatch from 'wildcard-match'
import { Event, EventTopic } from '@flatfile/api'
import { AuthenticatedClient } from './authenticated.client'
import { EventCallback, FlatfileEvent } from './flatfile.event'

export class EventHandler extends AuthenticatedClient {
  /**
   * Event target name, defaults to all events
   */
  public readonly targetName: string = '*'
  public slug?: string
  /**
   * Cache of registered listeners on this instance
   * @private
   */
  private eventListeners: [string | string[], EventCallback][] = []

  /**
   * Cache of registered child nodes for this listener
   * @private
   */
  private childNodes: [EventHandler, undefined | string][] = []

  /**
   * Register a subscriber for events that match this path
   *
   * @param listenerQuery any event name or grep pattern
   */
  on(listenerQuery: string | string[], callback: EventCallback) {
    this.eventListeners.push([listenerQuery, callback])
    return this
  }
  /**
   * Register a subscriber for events that match this path
   *
   * @param eventlistener any event name or grep pattern
   */
  addEventListener(listenerQuery: string | string[], callback: EventCallback) {
    this.eventListeners.push([listenerQuery, callback])
    return this
  }

  /**
   * Add child nodes to send this event to as well
   *
   * @param children
   */
  addNode(node: EventHandler, slug?: string) {
    this.childNodes.push([node, slug])
  }

  /**
   * Register a bulk set of listeners instead
   *
   * @param listeners
   */
  registerListeners(listeners: Record<string, EventCallback>) {
    for (const x in listeners) {
      this.addEventListener(x, listeners[x])
    }
  }

  /**
   * Emit an event and resolve the promise once it has completed (or errored
   * @param event
   */
  async emit(event: FlatfileEvent): Promise<void> {
    const target = this.findTargetNode(event)
    if (!target) {
      return
    } else {
      return target.trigger(event)
    }
  }

  /**
   * Actually trigger the event listeners on this particular target
   *
   * @note It is safer for now to run this in series to avoid IO locks and
   *       potential race conditions and uncaught errors
   *
   * @param event
   */
  async trigger(event: FlatfileEvent): Promise<void> {
    for (const cb of this.getListeners(event)) {
      await cb(event)
    }
  }

  /**
   * Get any listeners from this target subscribing to this event
   *
   * @param event
   */
  public getListeners(event: FlatfileEvent): EventCallback[] {
    return this.eventListeners
      .filter(([query]) => {
        if (event.name === EventTopic.Actiontriggered && event.action) {
          const isActionMatch = wildMatch(query, ':')
          return isActionMatch(event.action)
        }
        const isMatch = wildMatch(query, ':')
        return isMatch(event.name)
      })
      .map(([_q, cb]) => cb)
  }

  /**
   * Implement a function that returns a target name compatible with the event
   * routing system
   *
   * @param slug A context-defined slug (allows the same entity to be used in
   *             multiple contexts)
   */
  public getEventTargetName(slug?: string): string {
    if (slug) {
      return `${this.targetName}(${slug})`
    } else {
      return this.targetName
    }
  }

  /**
   * Traverse through entire target tree and find the target node to emit from
   *
   * @param target
   * @param slug
   */
  public findTargetNode(
    event: FlatfileEvent,
    slug?: string
  ): EventHandler | undefined {
    if (this.getEventTargetName(slug) === event.target) {
      return this
    }

    const childNodes = this.childNodes
      .map(([n, slug]) => {
        return n.findTargetNode(event, slug)
      })
      .filter((v) => v)

    return childNodes.length > 0 ? childNodes[0] : undefined
  }

  public async routeEvent(event: Event) {
    const internalEvent = new FlatfileEvent(event)

    await this.emit(internalEvent)
  }
}
