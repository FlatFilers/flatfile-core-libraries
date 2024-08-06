/**
 * The Flatfile Listener
 *
 * The Flatfile PubSub Client is just a simple event subscriber. It can
 * receive events from any PubSub driver. The default drivers are:
 *
 * - Webhook    (for simply processing events sent to URL)
 * - Websocket  (for subscribing real time on an HTTP2 connection)
 * - Serverless (for stateless invocations via AWS Lambda or similar)
 *
 * Once an event is received, it is routed to any awaiting listeners which
 * are added with `addEventListener()` or its alias `on()`.
 *
 * Flatfile events follow a standard structure and event listeners can use
 * any of the following syntaxes to react to events within Flatfile.
 *
 * // listen to an event
 * addEventListener('entity:topic')
 *
 * // listen to an event on a specific namespace
 * addEventListener('entity:topic@namespace')
 *
 * // listen to a specific context on a namespace
 * addEventListener('entity:topic@namespace?context=us_sp_89234oihsdo')
 *
 * // filter by any
 * addEventListener('entity:topic@namespace?')
 *
 */

import { EventFilter, EventHandler } from './events'
import { EventDriver } from './event-drivers'

/**
 * @description Enables subscribing to events within a specific namespace and provides
 * methods for filtering, creating, mounting, and unmounting event listeners using
 * an Event Driver. It facilitates the handling of events by providing a flexible and
 * reusable event listener infrastructure.
 * 
 * @extends {EventHandler}
 */
export class FlatfileListener extends EventHandler {
  /**
   * @description Filters an array-like object using a callback function and returns
   * the result, passing two parameters: an array of strings representing namespaces
   * and an optional callback function.
   * 
   * @param {string | string[]} namespaces - Used for filtering purposes.
   * 
   * @returns {Array<this>} A filtered array of objects based on the given `namespaces`
   * and callback function `cb`.
   */
  namespace(namespaces: string | string[], cb?: SubFn<this>) {
    return this.filter({ namespaces }, cb)
  }

  /**
   * @description Creates an instance of the same class with a given `EventFilter`,
   * adds it as a node, and optionally calls a callback function with the created node
   * as an argument. The method returns the created client instance.
   * 
   * @param {EventFilter} filter - Used to specify filtering criteria.
   * 
   * @returns {this} An instance of the class that contains the method.
   */
  filter(filter: EventFilter, cb?: SubFn<this>): this {
    const client = new (this.constructor as any)(filter)
    this.addNode(client)
    cb?.(client)
    return client
  }

  /**
   * @description Generates an instance of itself, calls a provided callback function
   * with this instance as argument, and returns the instance. The type parameter `T`
   * ensures that the method can only be called on constructors of types that extend `FlatfileListener`.
   * 
   * @param {SubFn<T>} cb - Callback function.
   * 
   * @returns {T} A constructor of FlatfileListener that has been initialized by calling
   * the callback function with it as an argument.
   */
  public static create<T extends FlatfileListener>(
    this: Constructor<T>,
    cb: SubFn<T>
  ): T {
    const client = new this()
    cb(client)
    return client
  }

  /**
   * @description Mounts an event handler for the provided `driver`. It binds the current
   * object (`this`) to the driver's event handling mechanism, allowing it to receive
   * and process events from the driver. The method returns the modified instance of `FlatfileListener`.
   * 
   * @param {EventDriver} driver - Intended to provide event handling capabilities.
   * 
   * @returns {this} An instance of the current class. The exact nature and purpose of
   * this object are not specified within the provided code snippet.
   */
  mount(driver: EventDriver) {
    driver.mountEventHandler(this)
    return this
  }

  /**
   * @description Unregisters an event handler from the underlying `EventDriver`. It
   * removes the reference to the listener and returns the instance itself for further
   * method chaining.
   * 
   * @param {EventDriver} driver - Intended to unmount an event handler.
   * 
   * @returns {this} A reference to the object on which the function was called.
   */
  unmount(driver: EventDriver) {
    driver.unmountEventHandler(this)
    return this
  }

  /**
   * @description Returns a new instance of `FlatfileListener`. This allows for the
   * creation of multiple instances of the same listener, which can be used to handle
   * different tasks or events independently.
   * 
   * @returns {object} An instance of `FlatfileListener`.
   */
  fork() {
    return new FlatfileListener()
  }
}

type SubFn<T extends FlatfileListener> = (client: T) => void

type Constructor<T> = { new (): T }
