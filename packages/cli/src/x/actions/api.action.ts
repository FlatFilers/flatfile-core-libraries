import { FlatfileClient } from '@flatfile/api'
import { config } from '../../config'
import { apiKeyClient } from './auth.action'
import { render } from 'ink'
import React from 'react'
import { ApiOutput } from '../components/ApiOutput'

export async function executeApiAction(
  resource: string,
  method: string,
  options: any,
  ...args: any[]
) {
  const { waitUntilExit } = render(
    React.createElement(ApiOutput, {
      loading: true,
      resource,
      method
    })
  )

  try {
    const apiKey = options.apiKey || process.env.FLATFILE_API_KEY || process.env.FLATFILE_BEARER_TOKEN
    if (!apiKey) {
      render(
        React.createElement(ApiOutput, {
          error: 'API key is required. Set FLATFILE_API_KEY or FLATFILE_BEARER_TOKEN in your .env file',
          resource,
          method
        })
      )
      process.exit(1)
    }

    const apiUrl = options.apiUrl || process.env.FLATFILE_API_URL || 'https://platform.flatfile.com/api/v1'
    const client = apiKeyClient({ apiUrl, apiKey })

    // Get the resource from the client (e.g., client.workbooks, client.spaces)
    const resourceObj = (client as any)[resource]
    if (!resourceObj) {
      render(
        React.createElement(ApiOutput, {
          error: `Resource '${resource}' not found in API client`,
          resource,
          method
        })
      )
      process.exit(1)
    }

    // Get the method from the resource (e.g., create, list, delete)
    const methodFn = resourceObj[method]
    if (!methodFn) {
      render(
        React.createElement(ApiOutput, {
          error: `Method '${method}' not found for resource '${resource}'`,
          resource,
          method
        })
      )
      process.exit(1)
    }

    // Remove internal CLI options before passing to API
    const apiOptions = { ...options }
    delete apiOptions.apiKey
    delete apiOptions.apiUrl
    delete apiOptions.args

    // If we have a single argument and no other options, pass it directly
    const hasOnlyId = Object.keys(apiOptions).length === 0 && args.length === 1
    const methodArgs = hasOnlyId ? args : [apiOptions]

    // Execute the API call
    const result = await methodFn.call(resourceObj, ...methodArgs)
    
    render(
      React.createElement(ApiOutput, {
        data: result,
        resource,
        method
      })
    )

    await waitUntilExit()
    return result
  } catch (error: any) {
    render(
      React.createElement(ApiOutput, {
        error: error?.message || error,
        resource,
        method
      })
    )
    process.exit(1)
  }
} 