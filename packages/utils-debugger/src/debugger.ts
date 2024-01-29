import c from 'ansi-colors'
import { formatTime } from './format.time'
import { simplifyArgs } from './simplify.args'

export class Debugger {
  static logHttpRequest({
    method,
    url,
    statusCode,
    headers,
    startTime,
    error = false,
  }: {
    method: string
    url: string
    statusCode: number
    headers: any
    startTime: Date
    error?: boolean
  }) {
    const endTime = new Date()
    const timeDiff = endTime.getTime() - startTime.getTime() // Time difference in ms
    const ml = method.length

    method = method.toUpperCase()

    switch (method) {
      case 'GET':
        method = c.white.bgGreenBright(method)
        break
      case 'POST':
        method = c.white.bgBlueBright(method)
        break
      case 'PUT':
        method = c.white.bgYellowBright(method)
        break
      case 'DELETE':
        method = c.white.bgRedBright(method)
        break
      default:
        method = c.white.bgBlackBright(method)
    }

    const requestId = headers['x-request-id']?.split('-')[0] || ''

    const statusCodeColor =
      statusCode >= 200 && statusCode < 400
        ? c.green(statusCode.toString())
        : c.red(statusCode.toString())

    const status = !error ? Icon.Success : Icon.Error

    const logString = `  ${status} ${c.white.gray(
      (timeDiff.toString() + 'ms').padEnd(10)
    )} ${method}${' '.repeat(6 - ml)} ${statusCodeColor} ${c.white.bgYellow(
      url
    )} ${c.gray(requestId)}`

    this.log(() => logString)
  }

  static logEventSubscriber(query: any, filter?: any) {
    this.log(
      ({ gray, white }) =>
        `${gray.bold(' ↳ on(')}${white.magentaBright(
          Array.isArray(query) ? query.join(', ') : query
        )}, ${JSON.stringify(filter)}${gray.bold(')')}`
    )
  }

  static logEvent(e: any) {
    this.log(
      ({ black, gray }) =>
        `${black.bgMagentaBright(` ▶ ${e.topic} `)} ${formatTime(
          e.createdAt
        )} ${gray(e.id)}`
    )
  }

  static logInfo(message: string) {
    this.log(({ blue }) => `  ${Icon.Info}️ ${blue(message)}`)
  }

  static logWarning(message: string) {
    this.log(({ yellow }) => `  ${Icon.Warning}️ ${yellow(message)}`)
  }

  static logSuccess(message: string) {
    this.log(({ green }) => `  ${Icon.Success} ${green(message)}`)
  }

  static logError(message?: string, label?: string, prefix?: string) {
    this.log(
      ({ redBright, bgRedBright, bgYellow }) =>
        `  🔴 ${bgYellow.black(prefix || 'Error')}${
          label ? `:${bgRedBright.black(label)}` : ''
        } ${redBright(message || 'Error')}`
    )
  }

  static logMethod(
    method: string,
    args: any[],
    result: any,
    success: boolean,
    startTime: number
  ) {
    const endTime = performance.now()
    const status = success ? c.green('✓') : c.red('✗')
    console.log(
      `  ${status} ${c.gray(
        ((endTime - startTime).toFixed(2) + 'ms').padEnd(10)
      )} ${c.magentaBright(`${method}(`)}${prettyLog(args)}${c.magentaBright(
        ')'
      )} => ${prettyLog(result)}`
    )
  }

  static log(cb: (colors: typeof c) => string) {
    const line = cb(c)
    console.log(line)
  }
}

/**
 * Pretty log an array of arguments
 *
 * @param src
 */
export function prettyLog(src: any): string {
  if (src === undefined) {
    return c.white.bold('void')
  }
  const args = simplifyArgs(src)
  return args
    .map((arg) => {
      if (typeof arg === 'string') {
        return c.cyan(arg)
      }

      if (typeof arg === 'number') {
        return c.yellow(arg.toString())
      }

      if (typeof arg === 'boolean') {
        return c.magenta(arg.toString())
      }

      return c.white(arg)
    })
    .join(', ')
}

const Icon = {
  Success: c.green('✓'),
  Error: c.red('✗'),
  Info: c.blue('ℹ'),
  Warning: c.yellow('⚠'),
}
