import { DebugMethod } from './debug.method'

describe('DebugMethod decorator', () => {
  let consoleLogMock: jest.SpyInstance
  let consoleDirMock: jest.SpyInstance

  beforeAll(() => {
    // Mocking global.performance object
    global.performance = { now: jest.fn() } as any
  })

  beforeEach(() => {
    // Mocking console.log and console.dir
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
    consoleDirMock = jest.spyOn(console, 'dir').mockImplementation()

    // Mocking performance.now
    ;(global.performance.now as jest.Mock).mockImplementation(() => 1000)
  })

  afterEach(() => {
    // Clearing all mocks after each test
    jest.clearAllMocks()
  })

  afterAll(() => {
    // Restoring all mocks after all tests
    jest.restoreAllMocks()
  })

  it('should log method name, execution duration, success status, and inputs and outputs if DEBUG_LEVEL is "verbose"', () => {
    class TestClass {
      @DebugMethod()
      static testMethod(input: number) {
        return input * 2
      }
    }

    process.env.DEBUG_LEVEL = 'verbose'

    TestClass.testMethod(2)

    expect(consoleLogMock).toHaveBeenCalled() // Add more specific assertions here
    expect(consoleDirMock).toHaveBeenCalled() // Add more specific assertions here
  })

  it('should log method name, execution duration, and success status, but not inputs and outputs if DEBUG_LEVEL is not "verbose"', () => {
    class TestClass {
      @DebugMethod()
      static testMethod(input: number) {
        return input * 2
      }
    }

    delete process.env.DEBUG_LEVEL

    TestClass.testMethod(2)

    expect(consoleLogMock).toHaveBeenCalled() // Add more specific assertions here
    expect(consoleDirMock).not.toHaveBeenCalled()
  })

  it('should log the method execution without error', () => {
    class TestClass {
      @DebugMethod()
      static testMethod(input: number) {
        return input * 2
      }
    }

    TestClass.testMethod(2)

    expect(consoleLogMock).toHaveBeenCalled()
  })

  it('should log the method execution with error', () => {
    class TestClass {
      @DebugMethod()
      static testMethod(input: number) {
        throw new Error('Test Error')
      }
    }

    expect(() => TestClass.testMethod(2)).toThrowError('Test Error')
    expect(consoleLogMock).toHaveBeenCalled()
  })

  it('should log the method execution returning a resolved promise', async () => {
    class TestClass {
      @DebugMethod()
      static async testMethod(input: number) {
        return Promise.resolve(input * 2)
      }
    }

    await TestClass.testMethod(2)

    expect(consoleLogMock).toHaveBeenCalled()
  })

  it('should log the method execution returning a rejected promise', async () => {
    class TestClass {
      @DebugMethod()
      static async testMethod(input: number) {
        return Promise.reject('Test Error')
      }
    }

    await expect(TestClass.testMethod(2)).rejects.toEqual('Test Error')
    expect(consoleLogMock).toHaveBeenCalled()
  })
})
