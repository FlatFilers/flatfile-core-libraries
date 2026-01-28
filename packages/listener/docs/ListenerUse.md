# Using `listener.use()` in Flatfile Listener

The `use()` method in the Flatfile Listener provides a powerful way to extend and customize the listener's functionality. It allows you to add middleware or plugins to your listener instance, enabling more complex event handling and processing.

## Basic Usage

The `use()` method takes a function as an argument. This function receives the listener instance as its parameter, allowing you to add event listeners, set up custom logic, or modify the listener's behavior.

```typescript
import { FlatfileListener } from '@flatfile/listener'

const listener = new FlatfileListener()

listener.use((handler) => {
  // Add custom logic here
})
```

## Examples

### 1. Adding Multiple Event Listeners

You can use the `use()` method to group related event listeners:

```typescript
listener.use((handler) => {
  handler.on('file:created', (event) => {
    console.log('File created:', event.payload)
  })

  handler.on('file:updated', (event) => {
    console.log('File updated:', event.payload)
  })

  handler.on('file:deleted', (event) => {
    console.log('File deleted:', event.payload)
  })
})
```

### 2. Setting Up Custom Logic

You can implement custom logic that runs for multiple events:

```typescript
listener.use((handler) => {
  const logEvent = (event) => {
    console.log(`Event received: ${event.topic}`)
    console.log('Payload:', JSON.stringify(event.payload, null, 2))
  }

  handler.on('*', logEvent) // Log all events
})
```

### 3. Creating Reusable Plugins

You can create reusable plugins to share functionality across different listener instances:

```typescript
function createErrorHandler(errorCallback) {
  return (handler) => {
    handler.on('error', (event) => {
      console.error('An error occurred:', event.payload)
      errorCallback(event)
    })
  }
}

// Usage
const errorCallback = (event) => {
  // Send error to a logging service
}

listener.use(createErrorHandler(errorCallback))
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
  })
```

## Best Practices

1. **Modularity**: Use the `use()` method to create modular, reusable pieces of functionality.

2. **Separation of Concerns**: Group related event listeners or logic within a single `use()` call.

3. **Plugin Architecture**: Create plugins that can be easily shared across different parts of your application or even different projects.

4. **Error Handling**: Implement error handling logic using `use()` to ensure consistent error management across your listener.

5. **Performance**: Be mindful of the order of your `use()` calls, as they are executed in the order they are added.

By leveraging the `use()` method effectively, you can create more maintainable, modular, and extensible event handling systems with the Flatfile Listener.
