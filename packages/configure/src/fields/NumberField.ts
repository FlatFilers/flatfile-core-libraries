import { makeFieldLegacy } from '../ddl/MakeField'
import { NumberCast } from '../stdlib/CastFunctions'

export const NumberField = makeFieldLegacy<number, {}>(null, {
  type: 'number',
  cast: NumberCast,
})
