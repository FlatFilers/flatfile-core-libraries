import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'

export const debugPlugin = (listener: FlatfileListener) => {
  // Capture console output
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  }

  // Override console methods to capture output
  console.log = (...args) => {
    originalConsole.log(...args)
    listener.broadcast('debug:log', { level: 'log', message: args })
  }

  console.error = (...args) => {
    originalConsole.error(...args)
    listener.broadcast('debug:log', { level: 'error', message: args })
  }

  console.warn = (...args) => {
    originalConsole.warn(...args)
    listener.broadcast('debug:log', { level: 'warn', message: args })
  }

  console.info = (...args) => {
    originalConsole.info(...args)
    listener.broadcast('debug:log', { level: 'info', message: args })
  }

  // Capture all Flatfile events
  listener.on('*', async (event: FlatfileEvent) => {
    listener.broadcast('debug:event', {
      topic: event.topic,
      timestamp: new Date().toISOString(),
      data: event.data,
      context: event.context
    })
  })

  // Capture errors
  listener.on('error', async (error: Error) => {
    listener.broadcast('debug:error', {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack
    })
  })

  // Cleanup function to restore console
  const cleanup = () => {
    console.log = originalConsole.log
    console.error = originalConsole.error
    console.warn = originalConsole.warn
    console.info = originalConsole.info
  }

  return { cleanup }
} 