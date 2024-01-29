import PubNub from 'pubnub'
import { EventSubscriber } from '../utils/EventSubscriber'
import { initializePubnub } from '../utils/initializePubnub'

jest.mock('../utils/EventSubscriber', () => ({
  EventSubscriber: {
    getClient: jest.fn(),
  },
}))

const spaceId = 'your-space-id'
const accessToken = 'your-access-token'
const apiUrl = 'http://localhost:3000'

describe('initializePubnub', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should return pubnub when initialization is successful', async () => {
    const pubnub = new PubNub({
      subscribeKey: 'test-subscribe-key',
      uuid: 'test-uuid',
    })

    jest.spyOn(EventSubscriber, 'getClient').mockResolvedValueOnce({
      pubnub,
      token: accessToken,
    })

    const result = await initializePubnub({ spaceId, accessToken, apiUrl })

    expect(EventSubscriber.getClient).toHaveBeenCalledWith(
      spaceId,
      accessToken,
      apiUrl
    )
    expect(result).toBe(pubnub)
  })

  it('should throw an error if pubnub object is falsy', async () => {
    const error = new Error(
      'Failed to obtain pubnub object from Event Subscriber response'
    )

    jest.spyOn(EventSubscriber, 'getClient').mockRejectedValue(error)

    await expect(
      initializePubnub({ spaceId, accessToken, apiUrl })
    ).rejects.toThrow(
      'Failed to initialize Pubnub: Failed to obtain pubnub object from Event Subscriber response'
    )

    expect(EventSubscriber.getClient).toHaveBeenCalledWith(
      spaceId,
      accessToken,
      apiUrl
    )
  })
})
