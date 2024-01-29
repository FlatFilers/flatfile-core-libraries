import { Configuration, DefaultApi } from '@flatfile/api'
// TODO: We will need to make this conditional depending on if it's in the NodeVM or the Browser
import fetch, { RequestInit } from 'node-fetch'

const FLATFILE_API_URL =
  process.env.AGENT_INTERNAL_URL || 'http://localhost:3000'

export class AuthenticatedClient {
  private _api?: DefaultApi

  get api(): DefaultApi {
    if (this._api) {
      return this._api
    }

    const ClientConfig = new Configuration({
      basePath: `${FLATFILE_API_URL}/v1`,
      fetchApi: fetch,
      accessToken: process.env.FLATFILE_BEARER_TOKEN,
      headers: {
        Authorization: `Bearer ${process.env.FLATFILE_BEARER_TOKEN || '...'}`,
        'x-disable-hooks': 'true',
      },
    })
    return new DefaultApi(ClientConfig)
  }
  private _fetch?: any

  async fetch(url: string, options: RequestInit = {}) {
    if (this._fetch) {
      return this._fetch
    }

    const headers: RequestInit['headers'] = {
      Authorization:
        `Bearer ${process.env.FLATFILE_BEARER_TOKEN}` ?? `Bearer ...`,
      'x-disable-hooks': 'true',
      ...options.headers,
    }
    const fetchUrl = FLATFILE_API_URL + '/' + url

    return fetch(fetchUrl, {
      method: 'GET',
      ...options,
      headers,
    })
      .then((resp) => resp.json())
      .then((resp) => resp.data)
  }
}
