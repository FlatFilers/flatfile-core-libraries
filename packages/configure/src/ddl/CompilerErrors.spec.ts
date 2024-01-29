import { NumberField } from '../fields'
/*
  This is an odd type of test.  It contains code which is expected to compile, and code that when uncommented should throw a compile time error.  Since we can't easily call TSC as a library to verify behavior this is the best we can easily do
*/
const Constant = (rv: any) => {
  return (...args: any[]) => {
    return rv
  }
}

//the point of this function is to return a function that returns a promise... ASYNC
const AConstant = (rv: any) => {
  return (...args: any[]) => {
    return new Promise((resolve, reject) => {
      resolve(rv)
    })
  }
}

/*
//  These throw errors because they return an async function

NumberField({required:false, cast:AConstant(1)})
NumberField({required:false, validate:AConstant(1)})
*/

NumberField({ required: false, cast: Constant(1) })
NumberField({ required: false, default: 1 })
NumberField({
  required: false,
  compute: (val: number): number => {
    return 1
  },
})
NumberField({ required: false, validate: Constant(1) })
describe('Make Jest Happy ->', () => {
  test('One Test', () => {
    expect(1).toBe(1)
  })
})
