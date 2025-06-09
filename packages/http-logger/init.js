// @ts-nocheck

import { instrumentRequests } from './index.js'

// Automatically instrument HTTP requests when this module is imported
instrumentRequests()

// Re-export everything from the main module
export * from './index.js'
