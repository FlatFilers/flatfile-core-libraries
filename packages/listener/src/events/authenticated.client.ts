import { CrossEnvConfig } from '@flatfile/cross-env-config'
import fetch from 'cross-fetch'
import { ensureSingleTrailingSlash } from '../utils/helpers'

export class AuthenticatedClient {
  public _accessToken?: string
  public _apiUrl?: string

  constructor(accessToken?: string, apiUrl?: string) {
    const FLATFILE_API_URL =
      CrossEnvConfig.get('AGENT_INTERNAL_URL') || 'http://localhost:3000'
    const bearerToken = CrossEnvConfig.get('FLATFILE_BEARER_TOKEN')

    this._accessToken = accessToken || bearerToken || '...'

    this._apiUrl =
      apiUrl || FLATFILE_API_URL
        ? ensureSingleTrailingSlash(apiUrl || FLATFILE_API_URL)
        : undefined
  }

  async fetch(url: string, options?: any) {
    const headers = {
      Authorization: `Bearer ${this._accessToken}`,
      'x-disable-hooks': 'true',
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    const fetchUrl = this._apiUrl + url

    const fetchOptions = {
      method: options?.method || 'GET',
      headers,
      body: options?.data,
    }

    try {
      const response = await fetch(fetchUrl, fetchOptions)

      if (response.status >= 200 && response.status <= 399) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const responseData = (await response.json()) as { data: any }
          return responseData.data
        } else {
          const responseData = await response.text()
          return responseData
        }
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
    } catch (err) {
      console.log('event.fetch error: ', err)
    }
  }

  /**
   *
   * @deprecated use @flatfile/cross-env-config instead
   */
  public setVariables({
    accessToken,
    apiUrl,
  }: {
    accessToken?: string
    apiUrl?: string
  }) {
    this._accessToken = accessToken
    this._apiUrl = apiUrl
  }
}
