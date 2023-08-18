import { CrossEnvConfig } from '@flatfile/cross-env-config'
import axios from 'axios'

export class AuthenticatedClient {
  public _accessToken?: string
  public _apiUrl?: string

  constructor(accessToken?: string, apiUrl?: string) {
    const FLATFILE_API_URL =
      CrossEnvConfig.get('AGENT_INTERNAL_URL') || 'http://localhost:3000'
    const bearerToken = CrossEnvConfig.get('FLATFILE_BEARER_TOKEN')

    this._accessToken = accessToken || bearerToken || '...'

    this._apiUrl = apiUrl || FLATFILE_API_URL
  }

  async fetch(url: string, options?: any) {
    const headers = {
      Authorization: `Bearer ${this._accessToken}`,
      'x-disable-hooks': 'true',
    }
    const axiosInstance = axios.create({
      headers,
      validateStatus: (status) => {
        return status >= 200 && status <= 399
      },
    })
    const fetchUrl = this._apiUrl + '/' + url
    const config = {
      url: fetchUrl,
      method: 'GET',
      ...options,
    }
    try {
      const resp = await axiosInstance(config)
      return resp.data.data
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
