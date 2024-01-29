import _ from 'lodash'
import { Dirty } from '../ddl/Field'
import {
  NumberCast,
  BooleanCast,
  StringCast,
  DateCast,
  StringCastCompose,
  FallbackCast,
  ChainCast,
} from './CastFunctions'

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

  test('NumberCast handles most reasonable cases', () => {
    const assertNC = makeCastAssert(NumberCast)
    const assertThrow = makeCastAssertException(NumberCast)

    assertNC(undefined, null)
    assertNC(null, null)
    assertNC('', null)

    assertNC(5, 5)
    assertNC(500_000, 500000)

    assertNC('5', 5)
    assertNC('500,000', 500000)
    assertNC('500,000,000', 500000000)

    // throwing an error on 'four' allows the user to realize an error and rewrite 'four' to 4
    // even though 'four' could be interpreted as a number, we have chosen not to
    assertThrow('four', 'Value could not be interpreted as a number.')

    // NaNs are a complex topic, the basic reason we don't include them
    // is that they don't work well future computations or comparisons.
    // https://en.wikipedia.org/wiki/NaN

    // NaN !== NaN
    // (NaN > Nan) === false
    // (NaN < Nan) === false

    assertThrow('asdf', 'Value could not be interpreted as a number.')
    assertThrow('nan', 'Value could not be interpreted as a number.')
    assertThrow(NaN, 'Value could not be interpreted as a number.')

    // Similarly Infinity rarely comes up, and isn't Computable
    assertThrow(1 / 0, 'Value could not be interpreted as a number.')
    assertThrow(-1 / 0, 'Value could not be interpreted as a number.')

    // add tests for scientific notation and other number formats
  })

  test('StringCast handles most reasonable cases', () => {
    const assertSC = makeCastAssert(StringCast)
    assertSC(undefined, null)
    assertSC(null, null)
    assertSC('', null)

    assertSC('foo', 'foo')
  })

  test('BooleanCast handles most reasonable cases', () => {
    const assertBC = makeCastAssert(BooleanCast)
    const assertThrow = makeCastAssertException(BooleanCast)
    assertBC(undefined, null)
    assertBC(null, null)
    assertBC('', null)

    assertBC(true, true)
    assertBC(false, false)

    assertBC('true', true)
    assertBC('TRUE', true)
    assertBC('True', true)
    assertBC('trUe', true)
    assertBC('yes', true)
    assertBC('1', true)
    assertBC('y', true)
    assertBC('t', true)
    assertBC('on', true)

    assertBC('false', false)
    assertBC('fAlse', false)
    assertBC('no', false)
    assertBC('n', false)
    assertBC('f', false)
    assertBC('0', false)
    assertBC('-1', false)
    assertBC('off', false)

    assertThrow('foobar', 'Value could not be interpreted as a boolean.')
  })

  test('DateCast handles most reasonable cases', () => {
    // eventually I want this 2500 test file from pandas to be our goal for DWIM date parsing
    // https://github.com/pandas-dev/pandas/blob/main/pandas/tests/tools/test_to_datetime.py
    const assertDC = (raw: any, output: any): void => {
      expect(DateCast(raw)).toStrictEqual(output)
    }
    const assertThrow = makeCastAssertException(DateCast)
    assertDC(undefined, null)
    assertDC(null, null)
    assertDC('', null)

    const dString = '2022-07-30'
    const d = new Date(dString)
    assertDC(dString, d)

    assertThrow('foo', 'Value could not be interpreted as a date.')
    assertThrow(1 / 0, 'Value could not be interpreted as a date.')
    assertThrow('2022-07-35', 'Value could not be interpreted as a date.')
  })

  const Null = _.constant(null)
  const Five = _.constant(5)
  const Four = _.constant(4)

  test('ChainCast tests', () => {
    expect(Null()).toBe(null)
    expect(Five()).toBe(5)
    expect(Four()).toBe(4)

    expect(ChainCast(Null, Five)('asdf')).toBe(null)
    expect(ChainCast(Five, Four)('asdf')).toBe(4)
    expect(ChainCast(Five, Null)('asdf')).toBe(null)
  })

  test('FallbackCast function', () => {
    //no matter what is pased in, always5 returns 5
    const always5 = (raw: Dirty<number>) => 5
    const composed = FallbackCast(NumberCast, always5)

    //asdf will cast to a string, and be returned
    expect(composed('asdf')).toBe(5)
    expect(composed(null)).toBe(5)
  })

  test('StringCastCompose function', () => {
    //show that some work is done based the function being called
    const pickAString = (raw: string) => {
      if (raw === 'paddy') {
        return 'engineer'
      } else if (typeof raw === 'undefined') {
        return 'undefined'
      } else if (raw === null) {
        return 'null'
      }

      return raw
    }
    const composed = StringCastCompose(pickAString)

    //asdf will cast to a string, and be returned
    expect(composed('asdf')).toBe('asdf')
    // not the string "null" because pickAString will never be called
    expect(composed(null)).toBe(null)
    //not the string "undefined", because it will never be called like that
    //expect(composed(undefined)).toBe(null)
    expect(composed('paddy')).toBe('engineer')
  })

  // How do you plan to handle ambiguous dates where it's not clear from the numbers the position of Day and Month values e.g. 2022-04-06? I get this question from prospects and don't have a clear answer since we rely on date-fns and I'm not sure the exact behavior.

  // That's a good question.  for this release I think we're best off sticking with ISO Date parsing.
  // in an upcoming release we will start adding cast options
  // as `cast:{args for cast function}` or `castArgs:{args for cast function}`

  // The longterm goal is to make this part of mapping.  Looking at a single date, you can't tell the order of month vs day, looking at a whole column, you can, the position that has values over 12 is the day column, that dictates your cast function.  This doesn't even require reading a model built off of all of our imports, it could be inferred from most single imports.  I'm sure @stephen has thoughts about this.  The cast function should have access to metatdata about the import, informed by mapping.
})
