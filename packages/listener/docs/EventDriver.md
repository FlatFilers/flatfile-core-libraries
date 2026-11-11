# EventDriver

The `EventDriver` class is an abstract base class that provides a foundation for implementing event-driven functionality in the Flatfile Listener system. It manages the connection between event handlers and the actual event sources.

## Class: EventDriver

### Properties

- `protected _handler?: EventHandler`: An optional EventHandler instance that will process the events.

### Methods

#### `get handler(): EventHandler`

A getter that returns the current EventHandler instance.

- **Returns:** The current EventHandler instance.
- **Throws:** An error if the handler is not registered yet.

**Example:**
```typescript
const driver = new ConcreteEventDriver();
try {
  const handler = driver.handler;
  // Use the handler
} catch (error) {
  console.error('Handler not registered:', error.message);
}
```

#### `mountEventHandler(handler: EventHandler): this`

Mounts an EventHandler to the driver.

- **Parameters:**
  - `handler: EventHandler`: The EventHandler instance to mount.
- **Returns:** The EventDriver instance (for method chaining).

**Example:**
```typescript
const handler = new EventHandler();
const driver = new ConcreteEventDriver();
driver.mountEventHandler(handler);
```

#### `unmountEventHandler(handler: EventHandler): this`

Unmounts an EventHandler from the driver if it matches the current handler.

- **Parameters:**
  - `handler: EventHandler`: The EventHandler instance to unmount.
- **Returns:** The EventDriver instance (for method chaining).

**Example:**
```typescript
const handler = new EventHandler();
const driver = new ConcreteEventDriver();
driver.mountEventHandler(handler);
// ... later ...
driver.unmountEventHandler(handler);
```

#### `dispatchEvent(e: any): this`

Dispatches an event to the current handler.

- **Parameters:**
  - `e: any`: The event to dispatch.
- **Returns:** The EventDriver instance (for method chaining).

**Example:**
```typescript
const driver = new ConcreteEventDriver();
driver.mountEventHandler(new EventHandler());
driver.dispatchEvent({ type: 'custom_event', data: { /* ... */ } });
```

## Usage

The `EventDriver` class is designed to be extended by concrete implementations that connect to specific event sources. Here's an example of how you might implement and use a concrete EventDriver:

```typescript
import { EventDriver, EventHandler } from './path-to-flatfile-listener';

class WebSocketEventDriver extends EventDriver {
  private socket: WebSocket;

  constructor(url: string) {
    super();
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      this.dispatchEvent(JSON.parse(event.data));
    };
  }

  // Additional methods specific to WebSocket handling...
}

// Usage
const wsDriver = new WebSocketEventDriver('wss://api.example.com/events');
const eventHandler = new EventHandler();

eventHandler.on('custom_event', (event) => {
  console.log('Received custom event:', event);
});

wsDriver.mountEventHandler(eventHandler);

// The WebSocket will now dispatch events to the eventHandler
```

In this example, `WebSocketEventDriver` extends `EventDriver` to provide WebSocket-specific functionality. It creates a WebSocket connection and dispatches received messages as events to the mounted `EventHandler`.

The `EventDriver` abstraction allows for different types of event sources (WebSocket, HTTP polling, server-sent events, etc.) to be implemented consistently and interchangeably in the Flatfile Listener system.
