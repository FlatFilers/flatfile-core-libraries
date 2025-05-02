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

        // If no Content-Length header, track request size manually
        if (requestSize === undefined) {
          requestSize = 0
          const originalWrite = request.write
          request.write = function (chunk, encoding, callback) {
            const chunkSize = chunk ? (Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding)) : 0
            requestSize += chunkSize
            return originalWrite.apply(this, arguments)
          }
        }

        request.on("response", (response) => {
          // Try to get response size from Content-Length header first
          let responseSize = getSizeFromHeaders(response.headers)

          // If no Content-Length header, track response size manually
          if (responseSize === undefined) {
            responseSize = 0
            response.on("data", (chunk) => {
              responseSize += chunk.length
            })
          }

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
            })
          })
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

      // Try to get response size from Content-Length header first
      let responseSize = getSizeFromHeaders(response.headers)

      // If no Content-Length header and response can be cloned, measure it
      if (responseSize === undefined && response.clone && typeof response.clone === "function") {
        try {
          const clonedResponse = response.clone()
          const buffer = await clonedResponse.arrayBuffer()
          responseSize = buffer.byteLength
        } catch (e) {
          // If reading the response fails, we'll just log zero size
          responseSize = 0
        }
      }

      const logDetails = {
        error: !response.ok,
        method,
        url,
        startTime,
        headers,
        statusCode: response.status,
        requestSize,
        responseSize,
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
