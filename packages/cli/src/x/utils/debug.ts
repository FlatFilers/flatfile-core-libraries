export const DEBUG = process.env.FLATFILE_DEBUG === 'true'

export function debug(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  }
}
