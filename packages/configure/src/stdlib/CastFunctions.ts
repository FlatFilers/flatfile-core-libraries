import { isValid, toDate } from 'date-fns'
import { Dirty, Nullable } from '../ddl/Field'

const getUnableToCastMessage = (type: string) => {
  return `Value could not be interpreted as a ${type}.`
}

//it is good practice for cast functions to be exaustive over raw, and throw an error
//if the incoming value is not of the expected type
export const StringCast = (raw: Dirty<string>): string | null => {
  if (raw === undefined || raw === null) {
    return null
  } else if (typeof raw === 'string') {
    if (raw === '') {
      return null
    }
    return raw
  }
  throw new Error(`Value could not be interpreted as a string.`)
}

export const ChainCast = <InitialType, FinalType>(
  firstCast: (raw: Dirty<InitialType>) => Nullable<InitialType>,
  secondCast: (raw: InitialType | FinalType) => Nullable<FinalType>
): ((raw: Dirty<InitialType> | FinalType) => Nullable<FinalType>) => {
  const innerCast = (
    raw: Dirty<InitialType> | FinalType
  ): Nullable<FinalType> => {
    if (raw === undefined || raw === null) {
      return null
    } else if (typeof raw === 'string') {
      const val = firstCast(raw)
      if (val === null) {
        return null
      }
      return secondCast(val)
    } else {
      //maybe raw was FirstOperand, just have to guess at this point
      // at this point we know that raw is FirstOperand or T
      try {
        const val = firstCast(raw as InitialType)
        if (val === null) {
          return null
        }
        return secondCast(val)
      } catch (e: any) {
        //we expect this to fail if raw was actually FinalType if we got here
      }
    }
    // assume raw is FinalType
    return secondCast(raw)
  }
  return innerCast
}

export const StringChainCast = <FinalType>(
  secondCast: (raw: string | FinalType) => Nullable<FinalType>
) => {
  return ChainCast(StringCast, secondCast)
}

export const StringCastCompose = <T>(
  recipientCast: (raw: string) => Nullable<T>
): ((raw: Dirty<string> | T) => Nullable<T>) => {
  const innerCast = (raw: string | undefined | null | T): Nullable<T> => {
    if (raw === undefined || raw === null) {
      return null
    } else if (typeof raw === 'string') {
      const val = StringCast(raw)
      if (val === null) {
        return null
      }
      return recipientCast(val)
    } else {
      // typeof raw === typeof T... but you can't say typeof T with typescript
      return raw
    }
  }
  return innerCast
}

//FallbackCast
export const FallbackCast = <T>(
  firstCast: (raw: Dirty<T>) => Nullable<T>,
  fallbackCast: (raw: Dirty<T>) => Nullable<T>
) => {
  const retFunc = (raw: string | null | T) => {
    try {
      const firstResult = firstCast(raw)
      if (firstResult === null) {
        return fallbackCast(raw)
      } else {
        return firstResult
      }
    } catch (e) {
      return fallbackCast(raw)
    }
  }
  return retFunc
}

export const NumberCast = StringChainCast(
  (raw: string | number): number | null => {
    let num: number = 0
    if (typeof raw === 'number') {
      num = raw
    } else if (typeof raw === 'string') {
      // I think I just want the error to propagate here, so no wrapping
      const strippedStr = raw.replace(/,/g, '')
      num = Number(strippedStr)
    } else {
      throw new Error(getUnableToCastMessage('number'))
    }
    if (isFinite(num)) {
      return num
    } else {
      throw new Error(getUnableToCastMessage('number'))
    }
  }
)

// Some other truthy/falsy values I found lurking around in Mono:
// Mono/core/portal/src/utils/truthy.regex.ts
// export const falsyRegex = /^(0|n|no|false|off|disabled|falsch|nein)$/i
// export const truthyRegex = /^(1|y|yes|true|on|enabled|wahr|ja)$/i

// Mono/core/api/src/modules/DataAbstractionModule/Transformations/AJVValidationTransformation.ts
// Probably best not to inlcude other languages until we actually think through internationaliation
const TRUTHY_VALUES = ['1', 'yes', 'true', 'on', 't', 'y']
const FALSY_VALUES = ['-1', '0', 'no', 'false', 'off', 'f', 'n']

export const BooleanCast = StringChainCast(
  (raw: string | undefined | null | boolean): boolean | null => {
    if (typeof raw === 'boolean') {
      return raw
    } else if (typeof raw === 'string') {
      if (raw === '') {
        return null
      }
      const normString = raw.toLowerCase()
      if (TRUTHY_VALUES.includes(normString)) {
        return true
      }
      if (FALSY_VALUES.includes(normString)) {
        return false
      }
      throw new Error(getUnableToCastMessage('boolean'))
    } else {
      throw new Error(getUnableToCastMessage('boolean'))
    }
  }
)

export const DateCast = (
  raw: string | undefined | null | number | Date
): Date | null => {
  if (raw instanceof Date) {
    return raw
  } else if (typeof raw === 'number') {
    const numParsed = toDate(raw)
    if (isValid(numParsed)) {
      return numParsed
    } else {
      throw new Error(getUnableToCastMessage('date'))
    }
  } else if (typeof raw === 'string') {
    if (raw === '') {
      return null
    }
    const parsedDate = new Date(raw)
    if (isValid(parsedDate)) {
      return parsedDate
    } else {
      throw new Error(getUnableToCastMessage('date'))
    }
  }
  return null
}
