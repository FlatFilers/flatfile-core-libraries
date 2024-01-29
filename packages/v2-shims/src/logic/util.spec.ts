import { getRegexFlags, isEmpty, memo } from './util'

describe('utils.ts', () => {
  describe('memo', () => {
    it('should cache values properly', () => {
      const spy = jest.fn((t) => t)

      const f = memo(spy)
      const obj = { t: 1 }

      expect(spy).not.toBeCalled()

      f(obj)

      expect(spy).toBeCalledTimes(1)

      // called 10 more times
      Array.from(new Array(10)).forEach(() => f(obj))

      expect(spy).toBeCalledTimes(1)

      f({ t: 2 })

      expect(spy).toBeCalledTimes(2)
    })
  })

  describe('misc', () => {
    describe('isEmpty', () => {
      it('should detect empty values correctly', () => {
        expect(isEmpty('')).toBe(true)
        expect(isEmpty(null)).toBe(true)
        expect(isEmpty(undefined)).toBe(true)
        expect(isEmpty(true)).toBe(false)
        expect(isEmpty(false)).toBe(false)
        expect(isEmpty('test')).toBe(false)
        expect(isEmpty(12)).toBe(false)
      })
    })
  })

  describe('getRegexFlags', () => {
    it('works when no source is set', () => {
      const result = getRegexFlags()
      expect(result).toBe('')
    })

    it('works with an empty source object', () => {
      const result = getRegexFlags({})
      expect(result).toBe('')
    })

    it('works with all flags set to false', () => {
      const result = getRegexFlags({
        dotAll: false,
        ignoreCase: false,
        global: false,
        multiline: false,
        unicode: false,
      })
      expect(result).toBe('')
    })

    it('works with all flags set to true', () => {
      const result = getRegexFlags({
        dotAll: true,
        ignoreCase: true,
        multiline: true,
        unicode: true,
        global: true,
      })
      expect(result).toBe('simgu')
    })

    it('works with dotAll flag set to true', () => {
      const result = getRegexFlags({ dotAll: true })
      expect(result).toBe('s')
    })

    it('works with ignoreCase flag set to true', () => {
      const result = getRegexFlags({ ignoreCase: true })
      expect(result).toBe('i')
    })

    it('works with global flag set to true', () => {
      const result = getRegexFlags({ global: true })
      expect(result).toBe('g')
    })

    it('works with multiline flag set to true', () => {
      const result = getRegexFlags({ multiline: true })
      expect(result).toBe('m')
    })

    it('works with unicode flag set to true', () => {
      const result = getRegexFlags({ unicode: true })
      expect(result).toBe('u')
    })
  })
})
