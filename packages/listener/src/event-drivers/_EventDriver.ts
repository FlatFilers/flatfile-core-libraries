import { EventHandler } from '../events'

export abstract class EventDriver {
  _handler?: EventHandler

  public get handler(): EventHandler {
    if (!this._handler) {
      throw new Error('handler not registered yet')
    }
    return this._handler
  }

  /**
   * Mount an event handler
   *
   * @param handler
   */
  mountEventHandler(handler: EventHandler): this {
    this._handler = handler
    return this
  }

  /**
   * Unmount an event handler
   *
   * @param handler
   */
  unmountEventHandler(handler: EventHandler): this {
    if (this._handler === handler) {
      this._handler = undefined
    }
    return this
  }

  /**
   * Dispatch an event
   *
   * @param e
   */
  dispatchEvent(e: any): this {
    this.handler.dispatchEvent(e)
    return this
  }
}
