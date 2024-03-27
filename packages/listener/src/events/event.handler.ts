import { AuthenticatedClient } from './authenticated.client'
import { EventCallback, FlatfileEvent } from './flatfile.event'
import { glob, objectMatches } from './glob.match'
import type { Flatfile } from '@flatfile/api'

/**
 * EventHandler is a Flatfile flavored implementation of EventTarget
 */
export class EventHandler extends AuthenticatedClient {
  /**
   * Apply a filter to the values of an event
   */
  public readonly filterQuery?: EventFilter

  /**
   * Cache of registered listeners on this instance
   * @private
   */
  protected listeners: [string | string[], EventFilter, EventCallback][] = []

  constructor(filter?: EventFilter, accessToken?: string, apiUrl?: string) {
    super(accessToken, apiUrl)
    if (filter) {
      this.filterQuery = filter
    }
  }

  /**
   * Cache of registered child nodes for this listener. These nodes will
   * only receive events that pass the parent filter.
   *
   * @private
   */
  protected nodes: EventHandler[] = []

  /**
   * Register a subscriber for events that match this path
   */
  on(query: Arrayable<string>, callback: EventCallback): this
  on(
    query: Arrayable<string>,
    filter: EventFilter,
    callback: EventCallback
  ): this
  on(
    query: Arrayable<string>,
    ...rest: [EventCallback] | [EventFilter, EventCallback]
  ): this {
    let filter: EventFilter = {}
    const callback: EventCallback = rest.pop() as EventCallback

    if (rest.length) {
      filter = rest.shift() as EventFilter
    }

    this.listeners.push([query, filter, callback])

    return this
  }

  off(query: Arrayable<string>, callback: EventCallback): this
  off(
    query: Arrayable<string>,
    filter: EventFilter,
    callback: EventCallback
  ): this

  // Implementation
  off(
    query: Arrayable<string>,
    filterOrCallback: EventFilter | EventCallback,
    maybeCallback?: EventCallback
  ): this {
    let filter: EventFilter | undefined = undefined
    let callback: EventCallback

    if (typeof filterOrCallback === 'function') {
      callback = filterOrCallback as EventCallback
    } else {
      filter = filterOrCallback
      callback = maybeCallback!
    }

    this.listeners = this.listeners.filter(
      ([listenerQuery, listenerFilter, listenerCallback]) => {
        // Normalize query for comparison
        const normalizedListenerQuery = Array.isArray(listenerQuery)
          ? listenerQuery
          : [listenerQuery]
        const normalizedQuery = Array.isArray(query) ? query : [query]

        // Match checks
        const isQueryMatch =
          JSON.stringify(normalizedListenerQuery) ===
          JSON.stringify(normalizedQuery)
        const isCallbackMatch = listenerCallback === callback
        const isFilterMatch = filter
          ? JSON.stringify(listenerFilter) === JSON.stringify(filter)
          : true

        // Keep the listener if it doesn't match all criteria for removal
        return !(isQueryMatch && isCallbackMatch && isFilterMatch)
      }
    )

    return this
  }

  /**
   * Add child nodes to send this event to as well
   *
   * @param node
   */
  addNode(node: EventHandler): this {
    this.nodes.push(node)
    return this
  }

  /**
   * Dispatch an event and resolve the promise once it has completed (or
   * errored
   *
   * @todo - is there a right order in which to resolve event listeners?
   *   Should it matter?
   *
   * @param event
   */
  async dispatchEvent(
    event: FlatfileEvent | Flatfile.Event | any
  ): Promise<void> {
    if (!event) return
    const eventPayload = event.src ? event.src : event

    event = new FlatfileEvent(eventPayload, this._accessToken, this._apiUrl)

    await this.trigger(event, true)

    for (const [_key, cb] of event.afterAllCallbacks) {
      await cb(event)
    }

    event.cache.delete()
  }

  /**
   * @deprecated legacy shim for receiving events from the VM layer
   * @alias dispatchEvent
   * @param event
   */
  async routeEvent(event: Flatfile.Event) {
    return this.dispatchEvent(event)
  }

  /**
   * Actually trigger the event listeners on this particular target
   *
   * @note It is safer for now to run this in series to avoid IO locks and
   *       potential race conditions and uncaught errors
   *
   * @param event
   * @param recursive
   */
  async trigger(
    event: FlatfileEvent,
    recursive: boolean = false
  ): Promise<void> {
    const listeners = this.getListeners(event, recursive)
    for (const cb of listeners) {
      await cb.callback(event)
    }
  }

  /**
   * Get any listeners from this target subscribing to this event
   *
   * @param event
   * @param recursive
   */
  public getListeners(
    event: FlatfileEvent,
    recursive: boolean = false
  ): Listener[] {
    // never return any listeners if the event doesn't match the filter
    // event recursion should not occur either
    if (!this.matchEvent(event, this.filterQuery)) {
      return []
    }

    // look at listeners registered here
    const listeners = this.listeners
      .filter(([query, filter]) => {
        const globbed = glob(event.topic, query)
        const matched = this.matchEvent(event, filter)
        return globbed && matched
      })
      .map(([query, filter, callback]) => ({ query, filter, callback }))

    return !recursive
      ? listeners
      : [
          ...listeners,
          ...this.nodes.flatMap((n) => n.getListeners(event, true)),
        ]
  }

  /**
   * Attach more event listeners using a callback function. Used most
   * frequently for plugins.
   *
   * @param fn
   */
  use(fn: (handler: this) => void): this {
    fn(this)
    return this
  }

  /**
   * Filter an event out based on glob filter object
   *
   * @param event
   * @param filter
   */
  public matchEvent(
    event: FlatfileEvent,
    filter: EventFilter | undefined
  ): boolean {
    return filter ? objectMatches(event, filter) : true
  }

  public detach() {
    // Clear the listeners array
    this.listeners = []

    // Optionally, also detach all child nodes
    this.nodes.forEach((node) => node.detach())
    this.nodes = []

    // Additional cleanup logic, if necessary
    // e.g., Unsubscribe from external services or event sources
  }
}

export type EventFilter = Record<
  string,
  any
  // TODO: Open question - 1 level nested object. Do we want/need more than that?
  // Arrayable<string> | Record<string, Arrayable<string>>
>

export type Arrayable<T> = T | Array<T>
export type Listener = {
  query: string | string[]
  filter: any
  callback: EventCallback
}

// Utility function to compare queries/filters
function isEqual(a: any, b: any): boolean {
  // Implement comparison logic based on your application's needs
  // This could be as simple as JSON.stringify(a) === JSON.stringify(b) for shallow comparison
  // Or more complex deep comparison logic for nested objects
  return JSON.stringify(a) === JSON.stringify(b)
}
