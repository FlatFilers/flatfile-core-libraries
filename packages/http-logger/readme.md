# @flatfile/http-logger

A lightweight, flexible HTTP request logger for Node.js applications that provides detailed logging for HTTP requests.

## Features

- 🔍 Automatically logs all HTTP/HTTPS requests and fetch API calls
- 🔄 Tracks request and response sizes, durations, and status codes
- 📊 Special handling for streaming responses
- ⚡ Minimal performance impact
- 🧩 Works with both Node.js HTTP/HTTPS modules and global fetch
- 🔌 Integrates with Flatfile's debugging tools
- 📝 Full TypeScript support with type definitions

## Installation

```bash
# npm
npm install @flatfile/http-logger

# yarn
yarn add @flatfile/http-logger

# pnpm
pnpm add @flatfile/http-logger

# bun
bun add @flatfile/http-logger
```

## Usage

### Auto-Initialization

The simplest way to use this library is with the auto-initializing import that automatically instruments all HTTP requests:

```javascript
// Import the /init version to automatically instrument requests
import '@flatfile/http-logger/init';

// That's it! All HTTP requests will now be automatically logged
```

### Manual Initialization

Alternatively, you can explicitly initialize the logger:

```javascript
import { instrumentRequests } from '@flatfile/http-logger';

// Call this early in your application startup
instrumentRequests();

// All HTTP requests will now be automatically logged
```

### Manual Logging

You can also manually log HTTP requests:

```javascript
import { logHttpRequest } from '@flatfile/http-logger';

// Log a request manually
logHttpRequest({
  method: 'GET',
  url: 'https://api.example.com/data',
  startTime: new Date(), // when the request started
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  requestSize: 0,
  responseSize: 1024,
  isStreaming: false
});
```

## API

### `instrumentRequests()`

Patches the native HTTP modules and fetch API to automatically log all HTTP requests. This should be called early in your application.

```javascript
import { instrumentRequests } from '@flatfile/http-logger';
instrumentRequests();
```

### `logHttpRequest(logData)`

Logs HTTP request details to both Flatfile's internal debugger and any global HTTP logger.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `logData.error` | boolean | Whether the request resulted in an error |
| `logData.method` | string | HTTP method used (GET, POST, etc.) |
| `logData.url` | string | Request URL |
| `logData.startTime` | Date | When the request started |
| `logData.headers` | Object | Response headers |
| `logData.statusCode` | number | Response status code |
| `logData.requestSize` | number | Size of request in bytes |
| `logData.responseSize` | number | Size of response in bytes |
| `logData.isStreaming` | boolean | Whether this is a streaming response |

## How it Works

The library patches Node's native HTTP/HTTPS modules and the global fetch API to intercept requests and responses. It calculates timing and size information, and handles streaming responses appropriately.

For streaming responses, it logs information as soon as headers are received, while for regular responses it waits until the full response is received.

## Environment Handling

In AWS Lambda or CI environments, ANSI color codes are automatically stripped from console output to improve log readability.

## License

MIT
