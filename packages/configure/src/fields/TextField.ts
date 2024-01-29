import { makeFieldLegacy } from '../ddl/MakeField'
import { StringCast } from '../stdlib/CastFunctions'

export const TextField = makeFieldLegacy<string, {}>(null, {
  type: 'string',
  cast: StringCast,
})
