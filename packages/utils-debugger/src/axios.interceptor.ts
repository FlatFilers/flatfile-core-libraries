import { Debugger } from './debugger'
import type { AxiosStatic } from 'axios'

export function axiosInterceptor(axios: AxiosStatic) {
  axios.interceptors.request.use((request) => {
    // @ts-ignore
    request.metadata = { startTime: new Date() } // Start timing the request

    return request
  })

  axios.interceptors.response.use(
    (response) => {
      Debugger.logHttpRequest({
        method: response.config.method!,
        url: response.config.url!,
        statusCode: response.status,
        headers: response.headers,
        // @ts-ignore
        startTime: response.config.metadata.startTime,
      })

      return response
    },
    (error) => {
      Debugger.logHttpRequest({
        method: error.config.method,
        url: error.config.url,
        statusCode: error.status || 0,
        headers: error.headers,
        startTime: error.config.metadata.startTime,
        error: true,
      })

      return Promise.reject(error)
    }
  )
}
