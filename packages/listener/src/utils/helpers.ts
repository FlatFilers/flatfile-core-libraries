export const ensureSingleTrailingSlash = (url: string) => {
  // Remove all trailing slashes
  while (url.endsWith('/')) {
    url = url.slice(0, -1)
  }

  // Append one slash
  return url + '/'
}
