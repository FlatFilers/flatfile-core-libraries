import { Debugger } from './debugger'

type ColorFn = {
  (str: string): string
  [k: string]: ColorFn
}
jest.mock('ansi-colors', () => {
  const mockFn = <ColorFn>(str: string) => str
  mockFn.white = mockFn
  mockFn.magentaBright = mockFn
  mockFn.green = mockFn
  mockFn.blue = mockFn
  mockFn.red = mockFn
  mockFn.gray = mockFn
  mockFn.bgGreenBright = mockFn
  mockFn.bgBlueBright = mockFn
  mockFn.bgYellow = mockFn
  mockFn.bold = mockFn
  mockFn.bgYellowBright = mockFn
  mockFn.bgRedBright = mockFn
  mockFn.bgBlackBright = mockFn
  mockFn.black = mockFn
  mockFn.bgMagentaBright = mockFn
  mockFn.yellow = mockFn
  mockFn.greenBright = mockFn
  mockFn.redBright = mockFn
  return mockFn
})

describe('Debugger', () => {
  beforeEach(() => {
    jest.spyOn(global.console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('logHttpRequest', () => {
    it('should log an HTTP request', () => {
      const headers = { 'x-request-id': '12345-67890' }
      const startTime = new Date()
      const endTime = new Date(startTime.getTime() + 1000)
      const logString = /^ {2}✓ \d+ms +GET +200 http:\/\/example.com 12345/

      jest
        .spyOn(global.Date, 'now')
        .mockReturnValueOnce(startTime.getTime())
        .mockReturnValueOnce(endTime.getTime())

      Debugger.logHttpRequest({
        method: 'get',
        url: 'http://example.com',
        statusCode: 200,
        headers,
        startTime,
        error: false,
      })

      expect(console.log).toHaveBeenCalledWith(expect.stringMatching(logString))
    })
  })

  describe('logEventSubscriber', () => {
    it('should log an event subscriber', () => {
      const logString = ` ↳ on(subscribe, {"filter":"value"})`

      Debugger.logEventSubscriber('subscribe', { filter: 'value' })

      expect(console.log).toHaveBeenCalledWith(logString)
    })
  })

  describe('logEvent', () => {
    it('should log an event', () => {
      const createdAt = new Date()
      const logString = ` ▶ topic  `

      Debugger.logEvent({
        topic: 'topic',
        createdAt,
        id: 'id',
      })

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(logString)
      )
    })
  })

  describe('logWarning', () => {
    it('should log a warning', () => {
      const logString = `  ⚠️ warning message`

      Debugger.logWarning('warning message')

      expect(console.log).toHaveBeenCalledWith(logString)
    })
  })

  describe('logSuccess', () => {
    it('should log a success message', () => {
      const logString = `  ✓ success message`

      Debugger.logSuccess('success message')

      expect(console.log).toHaveBeenCalledWith(logString)
    })
  })

  describe('logInfo', () => {
    it('should log a success message', () => {
      const logString = `  ℹ️ info message`

      Debugger.logInfo('info message')

      expect(console.log).toHaveBeenCalledWith(logString)
    })
  })

  describe('logError', () => {
    it('should log an error without label or prefix', () => {
      const logString = `  🔴 Error error message`

      Debugger.logError('error message')

      expect(console.log).toHaveBeenCalledWith(logString)
    })

    it('should log an error with label', () => {
      const logString = `  🔴 Error:Label error message`

      Debugger.logError('error message', 'Label')

      expect(console.log).toHaveBeenCalledWith(logString)
    })

    it('should log an error with prefix', () => {
      const logString = `  🔴 prefix error message`

      Debugger.logError('error message', undefined, 'prefix')

      expect(console.log).toHaveBeenCalledWith(logString)
    })
  })

  describe('log', () => {
    it('should log a custom message', () => {
      const logString = `custom log`

      Debugger.log(() => 'custom log')

      expect(console.log).toHaveBeenCalledWith(logString)
    })
  })
})
