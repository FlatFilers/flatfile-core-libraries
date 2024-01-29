import { FlatfileClient } from '@flatfile/api'

export const authenticate = (
  key: string,
  apiUrl: string = 'https://platform.flatfile.com/api'
) => {
  /**
   * Instantiating this class with an incorrect key will not throw,
   * it will only throw when trying to access internal methods
   */
  return new FlatfileClient({
    token: key,
    environment: `${apiUrl}/v1`,
  })
}
