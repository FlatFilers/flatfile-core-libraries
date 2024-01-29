/**
 * Simplify a list of arguments for logging
 *
 * @param args
 */
export function simplifyArgs(args: any): SimplifiedArgs {
  if (!Array.isArray(args)) {
    args = [args]
  }
  return args.map((arg: any) => {
    if (typeof arg === 'string') {
      return arg.length > 15 ? arg.substring(0, 12).trimEnd() + '...' : arg
    }

    if (typeof arg === 'number' || typeof arg === 'boolean') {
      return arg
    }

    if (typeof arg === 'object' && arg !== null) {
      return `Object<${Object.keys(arg as object).length} keys>`
    }

    return String(arg)
  })
}

type SimplifiedArgs = (string | number | boolean)[]
