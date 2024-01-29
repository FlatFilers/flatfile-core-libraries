import { simplifyArgs } from './simplify.args'

describe('simplifyArgs', () => {
  it('should handle an array with different types of elements', () => {
    const input = [
      'short',
      'long string that needs to be shortened',
      123,
      true,
      false,
      { a: 1, b: 2 },
      null,
      undefined,
    ]
    const expectedOutput = [
      'short',
      'long string...',
      123,
      true,
      false,
      'Object<2 keys>',
      'null',
      'undefined',
    ]

    expect(simplifyArgs(input)).toEqual(expectedOutput)
  })

  it('should handle single non-array argument', () => {
    const input = 'long string that needs to be shortened'
    const expectedOutput = ['long string...']

    expect(simplifyArgs(input)).toEqual(expectedOutput)
  })

  it('should handle empty array', () => {
    const input: any[] = []
    const expectedOutput: any[] = []

    expect(simplifyArgs(input)).toEqual(expectedOutput)
  })

  it('should handle empty object', () => {
    const input = [{}]
    const expectedOutput = ['Object<0 keys>']

    expect(simplifyArgs(input)).toEqual(expectedOutput)
  })

  it('should handle complex object', () => {
    const input = [{ a: 1, b: 2, c: 3, d: 4 }]
    const expectedOutput = ['Object<4 keys>']

    expect(simplifyArgs(input)).toEqual(expectedOutput)
  })

  it('should handle null and undefined values', () => {
    const input = [null, undefined]
    const expectedOutput = ['null', 'undefined']

    expect(simplifyArgs(input)).toEqual(expectedOutput)
  })

  it('should handle boolean values', () => {
    const input = [true, false]
    const expectedOutput = [true, false]

    expect(simplifyArgs(input)).toEqual(expectedOutput)
  })
})
