export type InsSingle = object | string | number | boolean
type InsArray = InsSingle | InsSingle[]
export type NestedIns = InsSingle | InsArray[]
type Env = Record<string, NestedIns>
type fnType = (...args: any) => NestedIns

export const identitySingle = (arg: any) => arg
const sum = (...args: number[]) =>
  args.reduce((partialSum, a) => partialSum + a, 0)

export type FnSet = Record<string, fnType>
const baseFns: FnSet = {
  // @ts-ignore unused sheet
  log: (blah: NestedIns) => {
    // console.log(blah)
    return []
  },
  count: (arg: InsSingle[]) => arg.length,
  // arithmetic
  '+': sum,
  '-': (a: number, ...rest: number[]) => a - sum(...rest),
  '*': (...args: number[]) =>
    args.reduce((partialProduct, a) => partialProduct * a, 1),
  '/': (first: number, ...args: number[]) =>
    args.reduce((partialProduct, a) => partialProduct / a, first),
  mod: (a: number, b: number) => a % b,
  // comparisons
  '>': (a: number, b: number) => a > b,
  '<': (a: number, b: number) => a < b,
  '>=': (a: number, b: number) => a >= b,
  '<=': (a: number, b: number) => a <= b,
  '=': (a: any, b: any) => a === b,
  neq: (a: any, b: any) => a !== b,
  // math
  abs: Math.abs,
  min: (...args: number[]) => Math.min(...args),
  max: (...args: number[]) => Math.max(...args),
  round: (a: number) => Math.round(a),
  // logic
  not: (arg: any) => !arg,
  and: (...args: any) => args.every(identitySingle), // depends on JS truthiness
  or: (...args: any) => args.some(identitySingle), // depends on JS truthiness
}

export function makeInterpreter(extraFns: Record<string, fnType>) {
  const fns = Object.assign({}, baseFns, extraFns)

  function interpret(instruction: NestedIns, passedVariables?: Env) {
    let variables: Env = {}
    if (passedVariables !== undefined) {
      variables = passedVariables
    }

    const parseInstruction = (ins: NestedIns, variables: Env): NestedIns => {
      if (
        ['object', 'string', 'number', 'boolean'].includes(typeof ins) &&
        !Array.isArray(ins)
      ) {
        return ins
      } else if (Array.isArray(ins)) {
        const [fName, ...args] = ins
        // quote is a special function that returns the contents of it's
        // arg list, otherwise we could never have an array that started
        // with a function name
        if (fName === 'quote') {
          return args[0]
        }
        if (fName === 'variable') {
          const symbolName = args[0]
          if (typeof symbolName === 'string' && variables[symbolName]) {
            // this must be some kind of variable

            return variables[symbolName]
          } else {
            throw new Error(`Referenced non-existent variable ${symbolName}`)
          }
        }
        if (fName === 'when') {
          const [predicate, expr] = args
          if (parseInstruction(predicate, variables)) {
            // only evaluate expr if predicate evaluates to true
            return parseInstruction(expr, variables)
          }
          return []
        }

        if (typeof fName === 'string') {
          // find the function either in the fns namespace or in the variables namespace, store in `fn`
          const fn = fns[fName] || variables[fName]
          if (fn === undefined) {
            throw new Error(
              `Error, couldn't find function or variable ${fName} from ${JSON.stringify(
                ins
              )}`
            )
          }
          // recursively call parse instructions (which also evaluates the args
          const evaluatedArgs: NestedIns = args.map((arg) =>
            parseInstruction(arg, variables)
          )
          // pass all of the evaluated args to the `fn` we found
          try {
            if (Array.isArray(evaluatedArgs)) {
              return fn(...evaluatedArgs)
            } else {
              return fn(evaluatedArgs)
            }
          } catch (e) {
            throw new Error(`error calling function ${fName} ${e}`)
          }
        } else {
          // shouldn't get here, throw an error
          return ins.map((x) => parseInstruction(x, variables))
          // throw `Error, don't know how to interpret '${ins}'`
        }
      } else if (!Array.isArray(ins)) {
        // this must be a primitive argument, like {x: 0 y: 0}
        return ins
      } else {
        // shouldn't get here, throw an error
        throw new Error(`Error, don't know how to interpret '${ins}'`)
      }
    }
    return parseInstruction(instruction, variables)
  }
  return interpret
}
export const interpret = makeInterpreter({})
