import { FlatfileClient } from '@flatfile/api'

const authenticate = (
  key: string,
  apiUrl = 'https://platform.flatfile.com/api'
) =>
  new FlatfileClient({
    token: key,
    environment: `${apiUrl}/v1`,
  })

export default authenticate
