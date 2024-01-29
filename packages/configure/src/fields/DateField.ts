import { makeFieldLegacy } from '../ddl/MakeField'
import { DateCast } from '../stdlib/CastFunctions'

export const DateField = makeFieldLegacy<Date, {}>(null, {
  type: 'string',
  cast: DateCast,
  egressFormat: (v: Date) => {
    return v.toLocaleDateString()
  },
})
