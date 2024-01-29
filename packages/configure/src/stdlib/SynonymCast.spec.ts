import _ from 'lodash'
import { SynonymCast } from './SynonymCast'

describe('Cast Function tests ->', () => {
  const makeCastAssert = (castFn: any) => {
    const assertFn = (raw: any, output: any): void => {
      expect(castFn(raw)).toBe(output)
    }
    return assertFn
  }
  const makeCastAssertException = (castFn: any) => {
    const assertFn = (raw: any, error: string): void => {
      expect(() => {
        castFn(raw)
      }).toThrow(error)
    }
    return assertFn
  }

  test('SynonymCast works ', () => {
    const SpanishNum = SynonymCast(
      [
        ['un', ['1', 'one']],
        ['dos', ['2', 'two', 'dos']],
      ],
      (val: string) => `Couldn't convert '${val}' to a spanish number`
    )

    const assertNC = makeCastAssert(SpanishNum)
    const assertThrow = makeCastAssertException(SpanishNum)

    assertNC('1', 'un')
    assertNC('two', 'dos')
    assertThrow(
      'not a number',
      "Couldn't convert 'not a number' to a spanish number"
    )
  })
})
