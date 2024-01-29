import { FlatfileClient } from '@flatfile/api'
import { authenticate } from '../authenticate'

describe('authenticate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should return the instantiated FlatfileClient instance', () => {
    const key = 'your-publishable-key'
    const flatfileClientInstance = new FlatfileClient({
      token: key,
      environment: 'https://platform.flatfile.com/api/v1',
    })
    const mockFlatfileClient = jest
      .spyOn(FlatfileClient.prototype as any, 'constructor')
      .mockReturnValue(flatfileClientInstance)

    const result = authenticate(key)

    expect(result).toStrictEqual(flatfileClientInstance)
    expect(result).toBeInstanceOf(FlatfileClient)

    mockFlatfileClient.mockRestore()
  })
})
