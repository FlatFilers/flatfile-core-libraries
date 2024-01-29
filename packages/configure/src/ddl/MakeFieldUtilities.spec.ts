import _ from 'lodash'
import {
  FallbackCast,
  NumberCast,
  StringChainCast,
  StringCastCompose,
  ChainCast,
} from '../stdlib/CastFunctions'
import { Field, Message } from './Field'
import { TextField } from '../fields/'

import { makeField, mergeFieldOptions } from './MakeField'

// test all of this

const rawCurrencyCast = (val: string) => _.without(val, '$', ',', '€').join('')
const fullCurrencyCast = ChainCast(StringChainCast(rawCurrencyCast), NumberCast)
const fullCurrencyCast2 = ChainCast(
  StringChainCast(rawCurrencyCast),
  NumberCast
)

const makeReplaceRegexCast = (
  transformingRegex: RegExp,
  replacePattern: string
) => {
  const baseTransformer = (val: string): string =>
    val.replace(transformingRegex, replacePattern)
  return StringChainCast(baseTransformer)
}
const fullCurrencyCast3 = ChainCast(
  makeReplaceRegexCast(
    /* regex that only grabs numbers ignores all else */ /[^1-9]/g,
    ''
  ),
  NumberCast
)

const fullCurrencyCast4 = ChainCast(
  makeReplaceRegexCast(
    /* regex that only grabs numbers ignores all else */ /[^1-9]/g,
    ''
  ),
  NumberCast
)
const makeRejectRegexCast = (
  transformingRegex: RegExp,
  errorPattern: string
) => {
  const baseTransformer = (val: string): string => {
    if (!transformingRegex.test(val)) {
      //maybe return null, not sure
      throw new Error(`${val}, ${errorPattern}`)
    }
    return val
  }
  return StringCastCompose(baseTransformer)
}

const UUIDChecker = makeRejectRegexCast(
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
  'not a uuid'
)
const UUIDCreator = () => 'I-am-a-bad-UUID'

const uuidCast = FallbackCast(UUIDChecker, UUIDCreator)

/*
 * Returns a field with a built in cast rejectRegExp function, throws
 * an error when with an overriding cast function... because you
 * probably don't want to do that
 */

const makeMakeRegexRejectField = (
  transformingRegex: RegExp,
  errorPattern: string
) => {
  const retField = makeField<string>(
    TextField({}),
    {},
    (mergedOptions, newOptions) => {
      if (_.keys(newOptions).includes('cast')) {
        throw new Error(
          `Cannot instantiate this field with an overridden cast function`
        )
      }
      //naming help
      const consolidatedOptions = mergeFieldOptions(mergedOptions, {
        cast: makeRejectRegexCast(transformingRegex, errorPattern),
      })
      return new Field(consolidatedOptions)
    }
  )
  return retField
}

describe('makeField stuff', () => {
  test('makeField examples 2', () => {
    /**
     * https://en.wikipedia.org/wiki/CAS_Registry_Number
     *
     * Note this is just an example RegexP Field.  It doesn't actually
     * use the last digit to do checksum validation
     */
    const CASField = makeMakeRegexRejectField(
      /\d{2,7}-\d{2}-\d/,
      'Not a CAS number'
    )
    const instantiatedCAS = CASField({})
    expect(instantiatedCAS.getMessages('51-43-4')).toStrictEqual([])
    expect(instantiatedCAS.getMessages('7440-47-3')).toStrictEqual([])
    expect(instantiatedCAS.getMessages('paddy')).toStrictEqual([
      new Message('Error: paddy, Not a CAS number', 'error', 'cast'),
    ])
  })
})
