import { StringChainCast } from './CastFunctions'
import { Nullable } from '../ddl/Field'
import _ from 'lodash'

export const SynonymCast = <FinalType>(
  matchingVals: [FinalType, string[]][],
  errorFunc: (wrongVal: string) => string
) => {
  const matchingMap: Map<FinalType, string[]> = new Map()
  _.map(matchingVals, (keyVals: [FinalType, string[]]) =>
    matchingMap.set(keyVals[0], keyVals[1])
  )
  //verify that all entries in matchingVals arrays are unique
  const retFunc = StringChainCast<FinalType>(
    (val: string | FinalType): Nullable<FinalType> => {
      if (typeof val === 'string') {
        const retVal = _.filter(
          _.entries(matchingMap),
          (keyVals: [FinalType, string[]]) => {
            const key = keyVals[0] as FinalType
            const possibleVals = keyVals[1] as string[]
            if (possibleVals.includes(val)) {
              return [key] // must wrap because the val could possibly be false
            }
            return false
          }
        ) as FinalType[][]
        if (retVal.length === 0) {
          throw new Error(errorFunc(val))
        }
        return retVal[0][0] // pull out of the list
      } else {
        //@ts-ignore
        if (_.keys(matchingMap).includes(val)) {
          return val
        }
      }
      //@ts-ignore
      throw new Error(errorFunc(val))
    }
  )
  return retFunc
}
