/**
 * HTTP request log data interface
 */
export interface HttpLogData {
  /**
   * Whether the request resulted in an error
   */
  error?: boolean

  /**
   * HTTP method used (GET, POST, etc.)
   */
  method: string

  /**
   * Request URL
   */
  url: string

  /**
   * When the request started
   */
  startTime: Date

  /**
   * Response headers
   */
  headers?: Record<string, string> | Headers

  /**
   * Response status code
   */
  statusCode: number

  /**
   * Size of request in bytes
   */
  requestSize?: number

  /**
   * Size of response in bytes
   */
  responseSize?: number

  /**
   * Whether this is a streaming response
   */
  isStreaming?: boolean
}

/**
 * Global logger type definition for extending NodeJS.Global
 */
declare global {
  var httpLogger:
    | ((logData: {
        url: string
        method: string
        duration: number
        statusCode: number
        requestSize: number
        responseSize: number
        isStreaming?: boolean
      }) => void)
    | undefined
}

/**
 * Logs HTTP request details to both Flatfile's internal debugger and any global HTTP logger.
 * @param logData - HTTP request log data
 */
export function logHttpRequest(logData: HttpLogData): void

/**
 * Instruments HTTP requests to log them to the console.
 * Automatically patches Node's HTTP/HTTPS modules and global fetch to track and log requests.
 * This is useful for debugging HTTP interactions.
 */
export function instrumentRequests(): void
