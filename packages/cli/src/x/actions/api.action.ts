import { FlatfileClient } from '@flatfile/api'
import { config } from '../../config'
import { apiKeyClient } from './auth.action'

export async function executeApiAction(
  resource: string,
  method: string,
  options: any,
  ...args: any[]
) {
  try {
    const apiKey = options.apiKey || process.env.FLATFILE_API_KEY || process.env.FLATFILE_BEARER_TOKEN
    if (!apiKey) {
      console.error('API key is required. Set FLATFILE_API_KEY or FLATFILE_BEARER_TOKEN in your .env file')
      process.exit(1)
    }

    const apiUrl = options.apiUrl || process.env.FLATFILE_API_URL || 'https://platform.flatfile.com/api/v1'
    const client = apiKeyClient({ apiUrl, apiKey })

    // Get the resource from the client (e.g., client.workbooks, client.spaces)
    const resourceObj = (client as any)[resource]
    if (!resourceObj) {
      console.error(`Resource '${resource}' not found in API client`)
      process.exit(1)
    }

    // Get the method from the resource (e.g., create, list, delete)
    const methodFn = resourceObj[method]
    if (!methodFn) {
      console.error(`Method '${method}' not found for resource '${resource}'`)
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
    console.log(JSON.stringify(result, null, 2))
    return result
  } catch (error: any) {
    console.error('Error:', error?.message || error)
    process.exit(1)
  }
} 