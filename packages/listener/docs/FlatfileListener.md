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
})
```

### Adding Event Listeners

You can add event listeners using the `on` method:

```typescript
listener.on('file:created', (event) => {
  console.log('A new file was created:', event.payload)
})
```

### Namespace Filtering

You can listen to events within a specific namespace:

```typescript
listener.namespace('my-namespace', (namespaced) => {
  namespaced.on('record:created', (event) => {
    console.log('A record was created in my-namespace:', event.payload)
  })
})
```

### Advanced Filtering

You can apply more complex filters to your listeners:

```typescript
listener.filter(
  { namespaces: ['namespace1', 'namespace2'], topic: 'file:*' },
  (filtered) => {
    filtered.on('file:uploaded', (event) => {
      console.log(
        'A file was uploaded in namespace1 or namespace2:',
        event.payload
      )
    })
  }
)
```

### Mounting to a Driver

To start receiving events, you need to mount the listener to an event driver:

```typescript
import { Browser } from '@flatfile/listener'

const driver = new Browser({
  apiUrl: 'https://api.flatfile.com',
  accessToken: 'your-access-token',
  environmentId: 'env-123456',
})

listener.mount(driver)
```

## Advanced Features

### Forking

You can create a new instance of the listener with the same configuration using the `fork` method:

```typescript
const forkedListener = listener.fork()
```

### Unmounting

To stop receiving events, you can unmount the listener from its driver:

```typescript
listener.unmount(driver)
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
