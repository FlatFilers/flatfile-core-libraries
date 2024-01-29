import { makeFieldLegacy } from '../ddl/MakeField'
import { BooleanCast } from '../stdlib/CastFunctions'

export const BooleanField = makeFieldLegacy<boolean, {}>(null, {
  type: 'boolean',
  cast: BooleanCast,
})
