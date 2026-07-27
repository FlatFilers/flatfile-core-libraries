# EventCache

The `EventCache` class provides a simple caching mechanism for events in the Flatfile Listener system. It allows you to store, retrieve, and manage event data efficiently.

## Class: EventCache

### Properties

- `private eventCache: Map<any, any>`: A Map object that stores the cached events.

### Methods

#### `async init<T>(key: string, callback: () => Promise<T>): Promise<T>`

Initializes a cache entry if it doesn't exist, or returns the existing cached value.

- **Parameters:**
  - `key: string`: The unique identifier for the cache entry.
  - `callback: () => Promise<T>`: A function that returns a Promise resolving to the value to be cached.
- **Returns:** A Promise that resolves to the cached or newly computed value.

**Example:**
```typescript
const cache = new EventCache();
const data = await cache.init('user_data', async () => {
  return await fetchUserData();
});
```

#### `async set<T>(key: string, callback: () => Promise<T>): Promise<T>`

Updates an existing cache entry with a new value.

- **Parameters:**
  - `key: string`: The unique identifier for the cache entry.
  - `callback: () => Promise<T>`: A function that returns a Promise resolving to the new value to be cached.
- **Returns:** A Promise that resolves to the newly cached value.
- **Throws:** An error if the cache key is not found.

**Example:**
```typescript
try {
  const updatedData = await cache.set('user_data', async () => {
    return await updateUserData();
  });
} catch (error) {
  console.error('Failed to update cache:', error.message);
}
```

#### `get<T>(key: string): T`

Retrieves a value from the cache.

- **Parameters:**
  - `key: string`: The unique identifier for the cache entry.
- **Returns:** The cached value.
- **Throws:** An error if the cache key is not found.

**Example:**
```typescript
try {
  const userData = cache.get('user_data');
  console.log('User data:', userData);
} catch (error) {
  console.error('Failed to get cache:', error.message);
}
```

#### `delete(key?: string | string[]): void`

Deletes one or more entries from the cache, or clears the entire cache if no key is provided.

- **Parameters:**
  - `key?: string | string[]`: Optional. The key or array of keys to delete from the cache.
- **Throws:** An error if the cache key is not found.

**Example:**
```typescript
// Delete a single entry
cache.delete('user_data');

// Delete multiple entries
cache.delete(['user_data', 'app_settings']);

// Clear entire cache
cache.delete();
```

## Usage

The `EventCache` class is useful for storing and managing event-related data that you want to keep in memory for quick access. It's particularly helpful when you need to avoid redundant API calls or computations for frequently accessed data.

Here's a more comprehensive example of how you might use the `EventCache` in a Flatfile Listener context:

```typescript
import { EventCache } from './EventCache';

const eventCache = new EventCache();

async function handleUserEvent(userId: string) {
  try {
    // Try to get user data from cache, or fetch it if not present
    const userData = await eventCache.init(`user_${userId}`, async () => {
      console.log('Fetching user data from API...');
      return await fetchUserDataFromAPI(userId);
    });

    console.log('User data:', userData);

    // Update user data
    const updatedUserData = await eventCache.set(`user_${userId}`, async () => {
      console.log('Updating user data...');
      return await updateUserDataInAPI(userId, { lastActive: new Date() });
    });

    console.log('Updated user data:', updatedUserData);

    // Clear user data from cache when no longer needed
    eventCache.delete(`user_${userId}`);
  } catch (error) {
    console.error('Error handling user event:', error.message);
  }
}

// Usage
handleUserEvent('12345');
```

This example demonstrates how to use the `EventCache` to efficiently manage user data in an event-driven system, reducing unnecessary API calls and improving performance.
