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

  describe('status listener', () => {
    const token = (value: string) => ({
      data: {
        subscribeKey: 'subscribe-key',
        accountId: 'account-id',
        token: value,
      },
    })

    async function startAndGetStatusListener() {
      // @ts-ignore
      MockedFlatfileApi.events.getEventToken.mockResolvedValueOnce(
        token('token-1')
      )
      const driver = new PubSubDriver('test-env-id')
      await driver.start(true)
      // @ts-ignore
      const pubnub = MockedPubNub.mock.results[0].value
      const { status } = pubnub.addListener.mock.calls[0][0]
      return { pubnub, status }
    }

    const flushPromises = () => new Promise((r) => setImmediate(r))

    it('reauthenticates and reconnects on PNAccessDeniedCategory', async () => {
      const { pubnub, status } = await startAndGetStatusListener()
      // @ts-ignore
      MockedFlatfileApi.events.getEventToken.mockResolvedValueOnce(
        token('token-2')
      )

      status({
        error: true,
        category: 'PNAccessDeniedCategory',
        operation: 'PNSubscribeOperation',
        statusCode: 403,
        errorData: new Error('Forbidden'),
      })
      await flushPromises()

      expect(MockedDebugger.logError).toHaveBeenCalledWith(
        'Forbidden',
        'PNSubscribeOperation',
        'PNAccessDeniedCategory'
      )
      expect(MockedFlatfileApi.events.getEventToken).toHaveBeenCalledTimes(2)
      expect(pubnub.setToken).toHaveBeenLastCalledWith('token-2')
      expect(pubnub.reconnect).toHaveBeenCalledTimes(1)
    })

    it('logs other errors without reconnecting', async () => {
      const { pubnub, status } = await startAndGetStatusListener()

      status({
        error: true,
        category: 'PNNetworkIssuesCategory',
        operation: 'PNSubscribeOperation',
        statusCode: 0,
        errorData: { message: 'socket hang up' },
      })
      await flushPromises()

      expect(MockedDebugger.logError).toHaveBeenCalledWith(
        'socket hang up',
        'PNSubscribeOperation',
        'PNNetworkIssuesCategory'
      )
      expect(MockedFlatfileApi.events.getEventToken).toHaveBeenCalledTimes(1)
      expect(pubnub.reconnect).not.toHaveBeenCalled()
    })

    it('logs an undefined message when errorData has none', async () => {
      const { status } = await startAndGetStatusListener()

      status({
        error: true,
        category: 'PNUnknownCategory',
        statusCode: 500,
        errorData: 'unexpected payload',
      })

      expect(MockedDebugger.logError).toHaveBeenCalledWith(
        undefined,
        undefined,
        'PNUnknownCategory'
      )
    })
  })
})
