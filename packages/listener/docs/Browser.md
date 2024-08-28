# Browser

The `Browser` class is a concrete implementation of the `EventDriver` abstract class, specifically designed for browser-based environments. It provides functionality to handle Flatfile events in web applications.

## Class: Browser

### Properties

- `public _accessToken?: string`: The access token for authentication.
- `public _apiUrl?: string`: The URL of the API.
- `public _environmentId?: string`: The ID of the environment.

### Constructor

```typescript
constructor({
  apiUrl,
  accessToken,
  environmentId,
  fetchApi,
}: {
  apiUrl: string
  accessToken: string
  environmentId?: string
  fetchApi: any
})
```

Creates a new Browser instance.

- **Parameters:**
  - `apiUrl: string`: The URL of the API.
  - `accessToken: string`: The access token for authentication.
  - `environmentId?: string`: Optional. The ID of the environment.
  - `fetchApi: any`: Deprecated. The fetch API to use.

**Example:**
```typescript
const browserDriver = new Browser({
  apiUrl: 'https://api.flatfile.com',
  accessToken: 'your-access-token',
  environmentId: 'env-123456',
});
```

### Methods

#### `mountEventHandler(handler: EventHandler): this`

Mounts an EventHandler and sets necessary variables.

- **Parameters:**
  - `handler: EventHandler`: The EventHandler instance to mount.
- **Returns:** The Browser instance (for method chaining).

**Example:**
```typescript
const handler = new EventHandler();
const browserDriver = new Browser({
  apiUrl: 'https://api.flatfile.com',
  accessToken: 'your-access-token',
});

browserDriver.mountEventHandler(handler);
```

## Usage

The `Browser` class is used to create an event driver for browser-based applications that interact with the Flatfile API. Here's a more comprehensive example of how you might use the `Browser` class in a web application:

```typescript
import { Browser, EventHandler, FlatfileEvent } from '@flatfile/listener';

// Create a Browser instance
const browserDriver = new Browser({
  apiUrl: 'https://api.flatfile.com',
  accessToken: 'your-access-token',
  environmentId: 'env-123456',
});

// Create an EventHandler
const eventHandler = new EventHandler();

// Add event listeners
eventHandler.on('file:created', (event: FlatfileEvent) => {
  console.log('New file created:', event.payload);
});

eventHandler.on('data:imported', (event: FlatfileEvent) => {
  console.log('Data imported:', event.payload);
});

// Mount the event handler to the browser driver
browserDriver.mountEventHandler(eventHandler);

// Example of dispatching an event (this would typically be done by the Flatfile SDK)
browserDriver.dispatchEvent({
  topic: 'file:created',
  payload: {
    fileId: 'file-123',
    fileName: 'example.csv',
    createdAt: new Date().toISOString(),
  },
});

// Later, if you need to unmount the handler
browserDriver.unmountEventHandler(eventHandler);
```

In this example, we create a `Browser` instance with the necessary configuration. We then create an `EventHandler` and add listeners for specific Flatfile events. The event handler is mounted to the browser driver, allowing it to receive and process events.

The `Browser` class acts as a bridge between the Flatfile SDK (which would typically dispatch events) and your application's event handling logic. It ensures that the correct access token and API URL are used when interacting with the Flatfile API.

Note that in a real-world scenario, you wouldn't typically dispatch events manually as shown in the example. Instead, the Flatfile SDK would dispatch events based on user actions and server responses, and your event listeners would react to these events to update your application's state or perform other actions.
# Using `listener.use()` in Flatfile Listener

The `use()` method in the Flatfile Listener provides a powerful way to extend and customize the listener's functionality. It allows you to add middleware or plugins to your listener instance, enabling more complex event handling and processing.

## Basic Usage

The `use()` method takes a function as an argument. This function receives the listener instance as its parameter, allowing you to add event listeners, set up custom logic, or modify the listener's behavior.

```typescript
import { FlatfileListener } from '@flatfile/listener';

const listener = new FlatfileListener();

listener.use((handler) => {
  // Add custom logic here
});
```

## Examples

### 1. Adding Multiple Event Listeners

You can use the `use()` method to group related event listeners:

```typescript
listener.use((handler) => {
  handler.on('file:created', (event) => {
    console.log('File created:', event.payload);
  });

  handler.on('file:updated', (event) => {
    console.log('File updated:', event.payload);
  });

  handler.on('file:deleted', (event) => {
    console.log('File deleted:', event.payload);
  });
});
```

### 2. Setting Up Custom Logic

You can implement custom logic that runs for multiple events:

```typescript
listener.use((handler) => {
  const logEvent = (event) => {
    console.log(`Event received: ${event.topic}`);
    console.log('Payload:', JSON.stringify(event.payload, null, 2));
  };

  handler.on('*', logEvent); // Log all events
});
```

### 3. Creating Reusable Plugins

You can create reusable plugins to share functionality across different listener instances:

```typescript
function createErrorHandler(errorCallback) {
  return (handler) => {
    handler.on('error', (event) => {
      console.error('An error occurred:', event.payload);
      errorCallback(event);
    });
  };
}

// Usage
const errorCallback = (event) => {
  // Send error to a logging service
};

listener.use(createErrorHandler(errorCallback));
```

### 4. Chaining Multiple `use()` Calls

You can chain multiple `use()` calls to organize your code better:

```typescript
listener
  .use((handler) => {
    // Set up file event handlers
  })
  .use((handler) => {
    // Set up user event handlers
  })
  .use((handler) => {
    // Set up error handlers
  });
```

## Best Practices

1. **Modularity**: Use the `use()` method to create modular, reusable pieces of functionality.

2. **Separation of Concerns**: Group related event listeners or logic within a single `use()` call.

3. **Plugin Architecture**: Create plugins that can be easily shared across different parts of your application or even different projects.

4. **Error Handling**: Implement error handling logic using `use()` to ensure consistent error management across your listener.

5. **Performance**: Be mindful of the order of your `use()` calls, as they are executed in the order they are added.

By leveraging the `use()` method effectively, you can create more maintainable, modular, and extensible event handling systems with the Flatfile Listener.
# Using `listener.use()` in Flatfile Listener

The `use()` method in the Flatfile Listener provides a powerful way to extend and customize the listener's functionality. It allows you to add middleware or plugins to your listener instance, enabling more complex event handling and processing.

## Basic Usage

The `use()` method takes a function as an argument. This function receives the listener instance as its parameter, allowing you to add event listeners, set up custom logic, or modify the listener's behavior.

```typescript
import { FlatfileListener } from '@flatfile/listener';

const listener = new FlatfileListener();

listener.use((handler) => {
  // Add custom logic here
});
```

## Examples

### 1. Adding Multiple Event Listeners

You can use the `use()` method to group related event listeners:

```typescript
listener.use((handler) => {
  handler.on('file:created', (event) => {
    console.log('File created:', event.payload);
  });

  handler.on('file:updated', (event) => {
    console.log('File updated:', event.payload);
  });

  handler.on('file:deleted', (event) => {
    console.log('File deleted:', event.payload);
  });
});
```

### 2. Setting Up Custom Logic

You can implement custom logic that runs for multiple events:

```typescript
listener.use((handler) => {
  const logEvent = (event) => {
    console.log(`Event received: ${event.topic}`);
    console.log('Payload:', JSON.stringify(event.payload, null, 2));
  };

  handler.on('*', logEvent); // Log all events
});
```

### 3. Creating Reusable Plugins

You can create reusable plugins to share functionality across different listener instances:

```typescript
function createErrorHandler(errorCallback) {
  return (handler) => {
    handler.on('error', (event) => {
      console.error('An error occurred:', event.payload);
      errorCallback(event);
    });
  };
}

// Usage
const errorCallback = (event) => {
  // Send error to a logging service
};

listener.use(createErrorHandler(errorCallback));
```

### 4. Chaining Multiple `use()` Calls

You can chain multiple `use()` calls to organize your code better:

```typescript
listener
  .use((handler) => {
    // Set up file event handlers
  })
  .use((handler) => {
    // Set up user event handlers
  })
  .use((handler) => {
    // Set up error handlers
  });
```

## Best Practices

1. **Modularity**: Use the `use()` method to create modular, reusable pieces of functionality.

2. **Separation of Concerns**: Group related event listeners or logic within a single `use()` call.

3. **Plugin Architecture**: Create plugins that can be easily shared across different parts of your application or even different projects.

4. **Error Handling**: Implement error handling logic using `use()` to ensure consistent error management across your listener.

5. **Performance**: Be mindful of the order of your `use()` calls, as they are executed in the order they are added.

By leveraging the `use()` method effectively, you can create more maintainable, modular, and extensible event handling systems with the Flatfile Listener.
