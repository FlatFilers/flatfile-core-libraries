import { Debugger } from './debugger'
import type { AxiosStatic, AxiosRequestConfig, AxiosResponse } from 'axios'
import { axiosInterceptor } from './axios.interceptor'

jest.mock('./debugger', () => ({
  Debugger: {
    logHttpRequest: jest.fn(),
  },
}))

const mockAxios = {
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
} as unknown as AxiosStatic

describe('axiosInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets up request and response interceptors', () => {
    axiosInterceptor(mockAxios)
    expect(mockAxios.interceptors.request.use).toHaveBeenCalled()
    expect(mockAxios.interceptors.response.use).toHaveBeenCalled()
  })

  it('adds metadata to the request', () => {
    const mockRequest: AxiosRequestConfig = {}
    // @ts-ignore
    mockAxios.interceptors.request.use.mockImplementationOnce((callback) => {
      callback(mockRequest)
    })
    axiosInterceptor(mockAxios)
    // @ts-ignore
    expect(mockRequest.metadata).toBeDefined()
    // @ts-ignore
    expect(mockRequest.metadata.startTime).toBeInstanceOf(Date)
  })

  it('logs responses', () => {
    const mockResponse: AxiosResponse = {
      // @ts-ignore
      config: {
        url: 'http://test.com',
        method: 'GET',

        // @ts-ignore
        metadata: { startTime: new Date() },
      },
      headers: {},
      status: 200,
      data: {},
    }
    // @ts-ignore
    mockAxios.interceptors.response.use.mockImplementationOnce(
      // @ts-ignore
      (successCallback) => {
        successCallback(mockResponse)
      }
    )
    axiosInterceptor(mockAxios)
    expect(Debugger.logHttpRequest).toHaveBeenCalledWith({
      method: mockResponse.config.method,
      url: mockResponse.config.url,
      statusCode: mockResponse.status,
      headers: mockResponse.headers,
      // @ts-ignore
      startTime: mockResponse.config.metadata.startTime,
    })
  })
})
