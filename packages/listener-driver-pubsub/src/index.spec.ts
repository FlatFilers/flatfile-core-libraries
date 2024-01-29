import api from '@flatfile/api'
import PubNub from 'pubnub'
import { Debugger } from '@flatfile/utils-debugger'
import { PubSubDriver } from './index'

jest.mock('@flatfile/api', () => ({
  events: {
    getEventToken: jest.fn(),
  },
}))

jest.mock('pubnub', () => {
  return jest.fn(() => ({
    setToken: jest.fn(),
    addListener: jest.fn(),
    unsubscribeAll: jest.fn(),
    stop: jest.fn(),
    subscribe: jest.fn(),
    reconnect: jest.fn(),
  }))
})

jest.mock('@flatfile/utils-debugger')

const MockedFlatfileApi = api as jest.Mocked<typeof api>
const MockedPubNub = PubNub as jest.Mocked<typeof PubNub>
const MockedDebugger = Debugger as jest.Mocked<typeof Debugger>

describe('PubSubDriver', () => {
  beforeEach(() => {
    // @ts-ignore
    MockedFlatfileApi.events.getEventToken.mockClear()
    // @ts-ignore
    MockedPubNub.mockClear()
    MockedDebugger.logSuccess.mockClear()
    MockedDebugger.logError.mockClear()
  })

  it('should require an environmentId', async () => {
    // @ts-ignore
    const driver = new PubSubDriver(undefined)

    await expect(driver.start()).rejects.toThrow(
      'scope is required (must be an environment or space id)'
    )
  })

  it('should start successfully', async () => {
    const environmentId = 'test-env-id'

    // @ts-ignore
    MockedFlatfileApi.events.getEventToken.mockResolvedValueOnce({
      data: {
        subscribeKey: 'subscribe-key',
        accountId: 'account-id',
        token: 'token',
      },
    })

    const driver = new PubSubDriver(environmentId)

    await driver.start(true)

    expect(MockedFlatfileApi.events.getEventToken).toHaveBeenCalledWith({
      scope: environmentId,
    })
    expect(MockedPubNub).toHaveBeenCalledWith({
      subscribeKey: 'subscribe-key',
      subscribeRequestTimeout: 30_000,
      userId: 'account-id',
      restore: true,
    })
    await driver.shutdown()
  })
})
