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

export class FlatfileListener extends EventHandler {
  /**
   * Subscribe to events only within a certain namespace.
   *
   * @param namespace
   * @param cb
   */
  namespace(namespaces: string | string[], cb?: SubFn<this>) {
    return this.filter({ namespaces }, cb)
  }

  /**
   * Filter by namespace
   *
   * @param filter
   * @param cb
   */
  filter(filter: EventFilter, cb?: SubFn<this>): this {
    const client = new (this.constructor as any)(filter)
    this.addNode(client)
    cb?.(client)
    return client
  }

  /**
   * Start subscribing to events
   *
   * @param cb
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
   * Mount this client using an acceptable Event Driver
   */
  mount(driver: EventDriver) {
    driver.mountEventHandler(this)
    return this
  }

  /**
   * Unmount this client from the Event Driver
   */
  unmount(driver: EventDriver) {
    driver.unmountEventHandler(this)
    return this
  }

  fork() {
    return new FlatfileListener()
  }
}

type SubFn<T extends FlatfileListener> = (client: T) => void

type Constructor<T> = { new (): T }
# Flatfile Listener

The Flatfile Listener is a powerful and flexible event handling system designed for the Flatfile platform. It provides a robust framework for subscribing to and processing events in various environments, including webhooks, websockets, and serverless functions.

## Overview

The Flatfile Listener is built on top of the `EventHandler` class and extends its functionality to provide a more specialized interface for Flatfile-specific events. It allows developers to easily subscribe to events, filter them based on various criteria, and respond to them in real-time.

## Key Features

1. **Flexible Event Subscription**: Subscribe to events using various patterns and filters.
2. **Namespace Support**: Group event listeners by namespace for better organization.
3. **Filtering Capabilities**: Apply filters to event listeners for more granular control.
4. **Driver-based Architecture**: Support for multiple event sources through different drivers.
5. **Chainable API**: Fluent interface for easy configuration and setup.

## Usage

### Creating a Listener

You can create a new Flatfile Listener instance using the static `create` method:

```typescript
const listener = FlatfileListener.create((client) => {
  // Configure your listener here
});
```

### Adding Event Listeners

You can add event listeners using the `on` method:

```typescript
listener.on('file:created', (event) => {
  console.log('A new file was created:', event.payload);
});
```

### Namespace Filtering

You can listen to events within a specific namespace:

```typescript
listener.namespace('my-namespace', (namespaced) => {
  namespaced.on('record:created', (event) => {
    console.log('A record was created in my-namespace:', event.payload);
  });
});
```

### Advanced Filtering

You can apply more complex filters to your listeners:

```typescript
listener.filter({ namespaces: ['namespace1', 'namespace2'], topic: 'file:*' }, (filtered) => {
  filtered.on('file:uploaded', (event) => {
    console.log('A file was uploaded in namespace1 or namespace2:', event.payload);
  });
});
```

### Mounting to a Driver

To start receiving events, you need to mount the listener to an event driver:

```typescript
import { Browser } from '@flatfile/listener';

const driver = new Browser({
  apiUrl: 'https://api.flatfile.com',
  accessToken: 'your-access-token',
  environmentId: 'env-123456',
});

listener.mount(driver);
```

## Event Topics

Flatfile emits various events that you can listen to. Here's a list of available event topics:

1. **File Events**
   - `file:created`
   - `file:uploaded`
   - `file:deleted`

2. **Record Events**
   - `record:created`
   - `record:updated`
   - `record:deleted`

3. **Workbook Events**
   - `workbook:created`
   - `workbook:updated`
   - `workbook:deleted`

4. **Sheet Events**
   - `sheet:created`
   - `sheet:updated`
   - `sheet:deleted`

5. **Job Events**
   - `job:started`
   - `job:completed`
   - `job:failed`

6. **Space Events**
   - `space:created`
   - `space:updated`
   - `space:deleted`

7. **User Events**
   - `user:invited`
   - `user:joined`

8. **Data Events**
   - `data:imported`
   - `data:exported`

9. **Validation Events**
   - `validation:started`
   - `validation:completed`
   - `validation:error`

10. **Transformation Events**
    - `transform:started`
    - `transform:completed`
    - `transform:error`

This list is not exhaustive and may be updated as new features are added to the Flatfile platform. Always refer to the latest documentation for the most up-to-date list of event topics.

## Advanced Features

### Forking

You can create a new instance of the listener with the same configuration using the `fork` method:

```typescript
const forkedListener = listener.fork();
```

### Unmounting

To stop receiving events, you can unmount the listener from its driver:

```typescript
listener.unmount(driver);
```

## Best Practices

1. **Error Handling**: Always include error handling in your event listeners to prevent unhandled exceptions.

2. **Asynchronous Operations**: When performing asynchronous operations in your listeners, make sure to handle promises correctly.

3. **Performance**: Be mindful of the performance impact of your event handlers, especially for high-frequency events.

4. **Namespacing**: Use namespaces to organize your listeners, especially in large applications.

5. **Cleanup**: Remember to unmount listeners when they're no longer needed to prevent memory leaks.

## Conclusion

The Flatfile Listener provides a powerful and flexible way to handle events in the Flatfile ecosystem. By leveraging its features, you can build robust, event-driven applications that react in real-time to changes in your Flatfile environment.

For more detailed information on specific components, refer to the documentation for `EventHandler`, `EventDriver`, and other related classes.
