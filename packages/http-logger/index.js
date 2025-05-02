// @ts-nocheck

import { Debugger } from "@flatfile/utils-debugger"
import stripAnsi from "strip-ansi"

/**
 * Unified HTTP request logger function that logs to both Debugger.logHttpRequest and global.httpLogger
 * @param {Object} logData - HTTP request log data
 * @param {boolean} [logData.error] - Whether the request resulted in an error
 * @param {string} logData.method - HTTP method used
 * @param {string} logData.url - Request URL
 * @param {Date} logData.startTime - When the request started
 * @param {Object} [logData.headers] - Request headers
 * @param {number} logData.statusCode - Response status code
 * @param {number} [logData.requestSize] - Size of request in bytes
 * @param {number} [logData.responseSize] - Size of response in bytes
 * @param {boolean} [logData.isStreaming] - Whether this is a streaming response
 */
export function logHttpRequest(logData) {
  // Log to Debugger
  Debugger.logHttpRequest(logData)

  // Log to global.httpLogger if it exists
  if (typeof global.httpLogger === "function") {
    const endTime = new Date()
    const duration = endTime.getTime() - logData.startTime.getTime()

    global.httpLogger({
      url: logData.url,
      method: logData.method,
      duration,
      statusCode: logData.statusCode,
      requestSize: logData.requestSize || 0,
      responseSize: logData.responseSize || 0,
      isStreaming: logData.isStreaming,
    })
  }
}

/**
 * Gets size from headers if available
 * @param {Object} headers - Headers object
 * @returns {number|undefined} Size in bytes or undefined if not available
 */
function getSizeFromHeaders(headers) {
  if (!headers) return undefined

  // Check for content-length in various formats (case insensitive)
  const contentLength =
    headers["content-length"] ||
    headers["Content-Length"] ||
    (typeof headers.get === "function" && headers.get("content-length"))

  if (contentLength) {
    const size = parseInt(contentLength, 10)
    return isNaN(size) ? undefined : size
  }

  return undefined
}

/**
 * Checks if the response is likely to be a streaming response
 * @param {Object} headers - Response headers
 * @returns {boolean} True if it's likely a streaming response
 */
function isLikelyStreaming(headers) {
  if (!headers) return false

  // Check for streaming indicators in headers
  const transferEncoding =
    headers["transfer-encoding"] ||
    headers["Transfer-Encoding"] ||
    (typeof headers.get === "function" && headers.get("transfer-encoding"))

  if (transferEncoding && transferEncoding.toLowerCase() === "chunked") {
    return true
  }

  // Check for content-type that indicates streaming
  const contentType =
    headers["content-type"] ||
    headers["Content-Type"] ||
    (typeof headers.get === "function" && headers.get("content-type"))

  if (contentType) {
    const type = contentType.toLowerCase()
    return type.includes("stream") ||
           type.includes("event-stream") ||
           type.includes("octet-stream")
  }

  return false
}

/**
 * Calculates the size of a request body
 * @param {any} data - Request body data
 * @returns {number} Size in bytes
 */
function calculateRequestSize(data) {
  if (!data) return 0

  if (typeof data === "string") {
    return Buffer.byteLength(data)
  } else if (data instanceof Buffer) {
    return data.length
  } else if (data instanceof URLSearchParams) {
    return Buffer.byteLength(data.toString())
  } else if (data instanceof FormData || data instanceof Blob) {
    // We can't directly measure these, so we'll estimate
    try {
      return data.size || 0
    } catch (e) {
      return 0
    }
  } else if (typeof data === "object") {
    try {
      return Buffer.byteLength(JSON.stringify(data))
    } catch (e) {
      return 0
    }
  }

  return 0
}

/**
 * Instruments HTTP requests to log them to the console.
 * This is useful for debugging
 */
export function instrumentRequests() {
  global.__instrumented = global.__instrumented === undefined ? false : global.__instrumented

  if (global.__instrumented) {
    return
  } else {
    global.__instrumented = true
  }

  if (!!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.CI === "true") {
    const olog = console.log
    console.log = (farg, ...args) => olog(typeof farg === "string" ? stripAnsi(farg) : farg, ...args)
  }

  function requestLogger(httpModule) {
    const original = httpModule.request
    if (!httpModule.__instrumented) {
      httpModule.__instrumented = true
      httpModule.request = function (options, callback) {
        if ((options.href || options.host)?.includes("pndsn") || (options.href || options.host)?.endsWith("/ack")) {
          return original(options, callback)
        }
        const startTime = new Date()

        // Try to get request size from Content-Length header first
        let requestSize = getSizeFromHeaders(options.headers)

        const request = original.apply(this, [options, callback])

        // If no Content-Length header, track request size manually without breaking streaming
        if (requestSize === undefined) {
          requestSize = 0
          const originalWrite = request.write
          request.write = function (chunk, encoding, callback) {
            if (chunk) {
              const chunkSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding || 'utf8')
              requestSize += chunkSize
            }
            return originalWrite.apply(this, arguments)
          }

          // Also track the end method to ensure we catch all data
          const originalEnd = request.end
          request.end = function(chunk, encoding, callback) {
            if (chunk) {
              const chunkSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding || 'utf8')
              requestSize += chunkSize
            }
            return originalEnd.apply(this, arguments)
          }
        }

        request.on("response", (response) => {
          // Check if this is likely a streaming response
          const isStreaming = isLikelyStreaming(response.headers)

          // Try to get response size from Content-Length header
          let responseSize = getSizeFromHeaders(response.headers)

          // For non-streaming responses without Content-Length, track size
          // but for streaming ones, we'll just mark it as streaming
          if (responseSize === undefined && !isStreaming) {
            responseSize = 0
            response.on("data", (chunk) => {
              responseSize += chunk.length
            })
          }

          // Log immediately when headers are received for streaming responses
          if (isStreaming) {
            logHttpRequest({
              error: response.statusCode >= 400,
              method: options.method,
              url: options.href || options.proto + "://" + options.host + options.path,
              startTime,
              headers: response.headers,
              statusCode: response.statusCode,
              requestSize,
              responseSize: responseSize || 0,
              isStreaming: true,
            })
          } else {
            // For non-streaming, log when response is complete
            response.on("end", () => {
              logHttpRequest({
                error: response.statusCode >= 400,
                method: options.method,
                url: options.href || options.proto + "://" + options.host + options.path,
                startTime,
                headers: response.headers,
                statusCode: response.statusCode,
                requestSize,
                responseSize,
                isStreaming: false,
              })
            })
          }
        })
        return request
      }
    }
  }

  // eslint-disable-next-line
  requestLogger(require("http"))
  // eslint-disable-next-line
  requestLogger(require("https"))

  // Instrumenting fetch
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, init) => {
    const startTime = new Date()
    let method = "GET"
    let url = ""
    let headers = {}

    if (typeof input === "string") {
      url = input
      method = init?.method || "GET"
      headers = init?.headers || {}
    } else if (typeof input === "object") {
      url = input.url || ""
      method = input.method || "GET"
      headers = input.headers || {}
    }

    // Try to get request size from Content-Length header first
    let requestSize = getSizeFromHeaders(headers)

    // If no Content-Length header, try to calculate from body
    if (requestSize === undefined) {
      if (typeof input === "string" && init?.body) {
        requestSize = calculateRequestSize(init.body)
      } else if (typeof input === "object" && input.body) {
        requestSize = calculateRequestSize(input.body)
      } else {
        requestSize = 0
      }
    }

    try {
      const response = await originalFetch(input, init)

      // Check if this is likely a streaming response
      const isStreaming = isLikelyStreaming(response.headers) ||
                          (response.bodyUsed === false && response.body &&
                           typeof response.body.getReader === 'function');

      // Try to get response size from Content-Length header
      let responseSize = getSizeFromHeaders(response.headers)

      // For non-streaming responses without Content-Length, try to safely measure size
      // but ONLY if the response is not streaming and hasn't been used yet
      if (responseSize === undefined && !isStreaming &&
          response.bodyUsed === false && response.clone &&
          typeof response.clone === "function") {
        try {
          // Only attempt to measure size for small responses (< 10MB)
          const contentType = response.headers.get('content-type') || '';
          const isBinary = contentType.includes('image/') ||
                          contentType.includes('audio/') ||
                          contentType.includes('video/') ||
                          contentType.includes('application/octet-stream');

          // Skip size measurement for binary content or when we suspect large files
          if (!isBinary) {
            const clonedResponse = response.clone();

            // Set a size limit to avoid memory issues (10MB)
            const MAX_SIZE = 10 * 1024 * 1024;
            const reader = clonedResponse.body.getReader();
            let bytesRead = 0;
            let done = false;

            while (!done && bytesRead < MAX_SIZE) {
              const { value, done: doneReading } = await reader.read();
              done = doneReading;
              if (value) {
                bytesRead += value.length;
              }

              // If we hit the limit, stop measuring
              if (bytesRead >= MAX_SIZE) {
                break;
              }
            }

            responseSize = bytesRead;

            // If we hit the limit, mark this as an approximate size
            if (bytesRead >= MAX_SIZE) {
              responseSize = MAX_SIZE; // Indicate we hit the limit
            }
          }
        } catch (e) {
          // If reading the response fails, we'll just log zero size
          responseSize = 0;
        }
      }

      const logDetails = {
        error: !response.ok,
        method,
        url,
        startTime,
        headers: Object.fromEntries(response.headers.entries()),
        statusCode: response.status,
        requestSize,
        responseSize: responseSize || 0,
        isStreaming: isStreaming,
      }

      logHttpRequest(logDetails)

      return response
    } catch (error) {
      logHttpRequest({
        error: true,
        method,
        url,
        startTime,
        headers: {},
        statusCode: 0,
        requestSize,
        responseSize: 0,
      })
      throw error
    }
  }
}
