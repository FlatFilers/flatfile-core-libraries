import { FlatfileClient } from '@flatfile/api'

export const authenticate = (
  key: string,
  apiUrl = 'https://platform.flatfile.com/api'
) =>
  new FlatfileClient({
    token: key,
    environment: `${apiUrl}/v1`,
  })
