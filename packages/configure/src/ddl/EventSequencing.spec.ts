import { FieldTester, WorkbookTester } from './WorkbookTester'
import { NumberField, TextField } from '../fields'

const IdentitySingle = () => {
  return (arg: any) => {
    return arg
  }
}

const Constant = (rv: any) => {
  return (...args: any[]) => {
    return rv
  }
}

const Undefined = Constant(undefined)
const Null = Constant(null)

const Throw = (errType: string) => {
  return (...args: any[]) => {
    throw errType
  }
}

const C = Constant
const U = Undefined

const BaseField = { label: 'a', required: true }
describe('Field Hook ->', () => {
  test('correctly calls cast cast', async () => {
    const ft = new FieldTester(NumberField({ ...BaseField, cast: C(1) }))
    // verify that no matter what is passed in, `1` is the result of cast
    await ft.checkFieldResult('a', 1)
    await ft.checkFieldResult('50', 1)

    const ft2 = new FieldTester(
      NumberField({ ...BaseField, cast: C('a string') })
    )
    // verify that no matter what is passed in, `a string` is the result of cast
    await ft2.checkFieldResult('a', 'a string')
    await ft2.checkFieldResult('50', 'a string')
  })

  test('when cast returns throws an error, the original data is uneditted ', async () => {
    const ft = new FieldTester(
      NumberField({
        ...BaseField,
        cast: Throw('castError'),
      })
    )
    await ft.checkFieldResult('b', 'b')
    await ft.matchFieldMessage('b', {
      level: 'error',
      stage: 'cast',
      message: 'castError',
    })
  })
  test('when cast returns Null, that is stored to the record', async () => {
    const ft = new FieldTester(
      NumberField({
        ...BaseField,
        cast: Null,
      })
    )
    await ft.checkFieldResult('b', null)
  })

  test('when cast returns undefined, original data is unneditted, undefined treated as error', async () => {
    // note, this will generally only occur from untyped JS,
    // typescript should prevent functions that return undefined from
    // passing type checking
    const ft = new FieldTester(
      NumberField({
        ...BaseField,
        cast: Undefined,
      })
    )
    await ft.checkFieldResult('b', 'b')
    await ft.matchFieldMessage('b', {
      level: 'error',
      stage: 'cast',
      message:
        "Error: There was an error when processing value 'b'. The field attempted to cast 'b' to 'undefined'.",
    })
  })

  test('when cast returns Null, processing stops', async () => {
    const ft = new FieldTester(
      NumberField({
        ...BaseField,
        required: false, // important so required error isn't thrown
        cast: Null,
        validate: Throw('validation error'),
      })
    )
    // note that validation isn't called because the system errored after empty and processing stopped
    await ft.checkFieldResult('b', null)
    // verify there aren't any messages for this cell
    await ft.matchFieldMessage('b', false)
  })
})

test('when the typed value (cast + default) is Null, and required true an error is thrown', async () => {
  const ft = new FieldTester(
    NumberField({
      ...BaseField,
      cast: Null,
    })
  )
  // note that validation isn't called because the system errored after empty and processing stopped
  await ft.checkFieldResult('b', null)
  await ft.matchFieldMessage('b', {
    level: 'error',
    message: 'Required Value',
    stage: 'other',
  })
})

test('default is substituted when cast returns Null', async () => {
  const ft = new FieldTester(
    NumberField({
      ...BaseField,
      cast: Null,
      default: 5,
    })
  )
  await ft.checkFieldResult('b', 5)
})

test('default is not substituted when cast returns a non-null value', async () => {
  const ft = new FieldTester(
    NumberField({
      ...BaseField,
      cast: IdentitySingle(),
      default: 6,
    })
  )
  await ft.checkFieldResult('foo', 'foo')
  //in most implemetations an empty string is cast to Null, however
  //this implementation returns the empty string which is a value
  await ft.checkFieldResult('', '')
  //make sure we aren't treaty 0 as a boolean or truthy
  await ft.checkFieldResult(0, 0)
  await ft.checkFieldResult(null, 6)
})

test('processing stops after cast error even when default present and the result of the cell is the rawValue, with an error message ', async () => {
  const ft = new FieldTester(
    NumberField({
      ...BaseField,
      cast: Throw('castError'),
      default: 2,
    })
  )
  // empty should never be called becaust cast through an error
  await ft.matchFieldMessage('z', {
    level: 'error',
    stage: 'cast',
    message: 'castError',
  })
  // counterintuitively storing a string to a number field is the
  // correct answer, going with z allows the user to edit the
  // value and see the original
  await ft.checkFieldResult('z', 'z')
})

test('test that validation errors show up ', async () => {
  const ft = new FieldTester(
    NumberField({
      ...BaseField,
      cast: C(1),
      validate: Throw('called'),
    })
  )
  await ft.checkFieldMessage('10', 'called')
})

test("show that compute isn't called after a null cast  ", async () => {
  const ft = new FieldTester(
    NumberField({ ...BaseField, cast: Null, compute: C(32) })
  )
  // compute will never be called in this scenario
  await ft.checkFieldResult('e', null)
  await ft.checkFieldResult('60', null)
})
test("show that compute isn't called after an error on cast  ", async () => {
  const ft = new FieldTester(
    NumberField({
      ...BaseField,
      cast: Throw('CastError'),
      compute: C(35),
    })
  )
  // compute will never be called in this scenario, and we need to return the rawValue because cast threw an error
  await ft.checkFieldResult('e', 'e')
  await ft.checkFieldResult('60', '60')
})

test('show that compute error saves the original value', async () => {
  const ft = new FieldTester(
    NumberField({
      ...BaseField,
      cast: C(37),
      compute: Throw('ComputeError'),
    })
  )
  // compute will never be called in this scenario, and we need to return the rawValue because cast threw an error
  await ft.checkFieldResult('e', 'e')
  await ft.checkFieldResult('60', '60')
})

// Do we still want to test compute when cast throws an error?
// test('compute returning undefined is an error,  saves the original value', async () => {
//   const ft = new FieldTester({
//     ...BaseField,
//     compute: Undefined,
//   })
//   await ft.checkFieldResult('b', 'b')
//   await ft.matchFieldMessage('b', {
//     level: 'error',
//     stage: 'compute',
//     message:
//       "Error: calling compute of b with typed value of b returned undefined.  This is an error, fix 'compute' function",
//   })
// })

test('default NumberCast errors on string,  saves the original value', async () => {
  const ft = new FieldTester(
    NumberField({
      ...BaseField,
      compute: Undefined,
    })
  )
  await ft.checkFieldResult('b', 'b')
  await ft.matchFieldMessage('b', {
    level: 'error',
    stage: 'cast',
    message: 'Error: Value could not be interpreted as a number.',
  })
})

test('test that validation errors show up after record onChange, this currently fails because the new sheet doesnt call onChange at all', async () => {
  const rawData = { a: '10', b: '' }
  const message = 'called'
  const workbookTest = new WorkbookTester(
    {
      a: NumberField({
        ...BaseField,
        cast: C(1),
        compute: (v) => {
          return v * 2
        },
        validate: (v) => {
          if (v === 7) {
            throw 'called'
          }
        },
      }),
      b: TextField({}),
    },
    {
      recordCompute: (record: any) => {
        if (record.get('a') === 2) {
          record.set('a', 7)
        }
      },
    }
  )
  await workbookTest.checkRowResult({ rawData, message })
})
