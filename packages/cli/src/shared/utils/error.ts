import fs from 'fs'

export function stringifyError(error: any) {
  const errorObject = new Object() as any
  Object.getOwnPropertyNames(error).forEach((key) => {
    errorObject[key] = error[key]
  })
  return JSON.stringify(errorObject, null, 2)
}

export function writeErrorToFile(error: Error): Promise<void> {
  const serializedError = stringifyError(error)
  if (process.env.DEBUG) {
    fs.appendFileSync('error.log', serializedError)
  }
}
