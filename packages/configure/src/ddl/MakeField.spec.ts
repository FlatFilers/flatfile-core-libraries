import _ from 'lodash'
import { SynonymCast } from '../stdlib/SynonymCast'
import { BooleanCast, FallbackCast, NumberCast } from '../stdlib/CastFunctions'
import { Field, Message } from './Field'
import { NumberField, TextField, BooleanField } from '../fields'
import {
  makeField,
  GenericDefaults,
  mergeFieldOptions,
  mergeValidate,
  makeFieldLegacy,
} from './MakeField'
import { FieldTester } from './WorkbookTester'

const Constant7 = _.constant(7)

const ConstantB = _.constant('B')
const ConstantQ = _.constant('Q')

describe('MakeField suite', () => {
  test('mergeFieldOptions tests', () => {
    //@ts-ignore  we are checking the behavior of mergeFieldOptions on objects here.  the types are for the way it is used
    const merged: Record<string, any> = mergeFieldOptions(GenericDefaults, {
      stageVisibility: { mapping: false },
    })

    expect(merged['stageVisibility']['review']).toBe(true)
    expect(merged['stageVisibility']['mapping']).toBe(false)
  })

  test('mergeFieldOptions funcs', () => {
    //@ts-ignore
    const merged: Record<string, any> = mergeFieldOptions(
      //@ts-ignore
      { a: Constant7 },
      { a: ConstantB }
    )

    expect(merged['a']).toBe(ConstantB)
  })
})

describe('makeField tests', () => {
  test('simple assertions', () => {
    const ConstructedTextField = makeField<string, {}>(TextField({}), {
      cast: ConstantB,
    })
    expect(ConstructedTextField({}).options.cast).toBe(ConstantB)

    const instantiatedWithOveride = ConstructedTextField({ cast: ConstantQ })
    expect(instantiatedWithOveride.options.cast).not.toBe(ConstantB)
    expect(instantiatedWithOveride.options.cast).toBe(ConstantQ)
    expect(instantiatedWithOveride.options.cast('asdf')).toBe('Q')

    //verify that functions compare by reference equality, not object === object
    expect(ConstantQ).not.toBe(ConstantB)

    expect(ConstructedTextField({}).options.cast).toBe(ConstantB)

    const instantiatedField = ConstructedTextField({})
    expect(instantiatedField.options.cast).toBe(ConstantB)
    expect(instantiatedField.options.cast('asdf')).toBe('B')
    expect(instantiatedField.toCastDefault('asdf')).toStrictEqual(['B', []])

    expect(instantiatedField.getValue('asdf')).toBe('B')
  })
  test('assert failing typechecks', () => {
    const TextFieldCastMismatch = makeField(TextField({}), {
      //the following should error because we are returning a number to type <string>
      //@ts-expect-error
      cast: Constant7,
    })
    const TextFieldNumberMismatch = makeField<number>(
      //the following should error because number doesn't agree with TextField
      //@ts-expect-error
      TextField({}),
      { cast: Constant7 }
    )
    const TextFieldCusotmizerMismatch = makeField(
      TextField({}),
      {},
      (mergedOptions, passedOptions) => {
        const consolidatedOptions = mergeFieldOptions(
          mergedOptions,
          // the following should fail because even inside of the customizer, we are trying to add a function that returns a number
          // to a field of OperatingType string
          //@ts-expect-error
          { cast: Constant7 }
        )
        return new Field(consolidatedOptions)
      }
    )
    expect(1).toBe(1)
  })
  test('assert failing typechecks for makeField', () => {
    const ReqField = makeField<string, { absolutelyRequiredOption: boolean }>(
      TextField(),
      {},
      (mergedOptions, passedOptions) => {
        mergedOptions.absolutelyRequiredOption === true
        return new Field(mergedOptions)
      }
    )
    // absolutelyRequiredOption not added
    //@ts-expect-error
    const instantiatedReqField = ReqField({})
    const instantiatedReqField2 = ReqField({ absolutelyRequiredOption: true })
    expect(instantiatedReqField2).toBeTruthy()
  })

  test('simple typechecks pass for reasonable normal ops', () => {
    const NumberField2 = makeFieldLegacy<number, {}>(null, {
      type: 'number',
      cast: NumberCast,
    })

    NumberField2({ validate: (val: number) => [] })
  })
  test('MakeFieldDefaultCustomizer works ', () => {
    //note, no template type necessary because that is picked up from NumberField
    const NumberField2 = makeField(NumberField(), {
      validate: (v: number) => {
        if (v < 5) {
          throw new Error('less than 5')
        }
      },
    })
    expect(NumberField2).toBeTruthy()
  })
  test('makeField examples 1', async () => {
    // test custom validate function
    const EmailField = makeField(TextField(), {
      validate: (val: string) => {
        const emailRegex = /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/
        if (!emailRegex.test(val)) {
          return [
            new Message(
              `${val} is not formatted like an email`,
              'warn',
              'validate'
            ),
          ]
        }
      },
    })

    const myEmailField = EmailField({})
    const emailTester = new FieldTester(myEmailField)
    await emailTester.checkFieldMessage('alexhollenbeck@gmail.com', false)
    await emailTester.checkFieldMessage(
      'notAnEmail',
      'notAnEmail is not formatted like an email'
    )
  })

  test('makeField with multiple merged validate functions', async () => {
    // test custom option used in validate
    const MoneyField = makeField<string, { currencySymbol: string }>(
      TextField({}),
      {},
      (mergedOptions, passedOptions) => {
        const extraValidate = (val: string) => {
          //@ts-ignore
          if (!val.includes(passedOptions.currencySymbol)) {
            return [
              new Message(
                //@ts-ignore
                `value must contain ${passedOptions.currencySymbol}`,
                'warn',
                'validate'
              ),
            ]
          }
        }

        const mergedValidate = mergeValidate(
          mergedOptions.validate,
          extraValidate
        )
        //naming help
        const consolidatedOptions = mergeFieldOptions(mergedOptions, {
          validate: mergedValidate,
        })
        return new Field(consolidatedOptions)
      }
    )
    const myMoneyField = MoneyField({ currencySymbol: '$' })
    const moneyTester = new FieldTester(myMoneyField)
    await moneyTester.checkFieldMessage('$100', false)
    await moneyTester.checkFieldMessage('€100', 'value must contain $')

    const BetterMoneyField = makeField<string>(
      MoneyField({
        currencySymbol: '$',
      }),
      {
        validate: (val: string) => {
          if (val.length > 5) {
            return [
              new Message(
                //@ts-ignore
                `value must be less than 5 in length`,
                'warn',
                'validate'
              ),
            ]
          }
        },
      },
      (mergedOptions, passedOptions, baseOptions, newDefaults) => {
        // TODO make this more intuitive by merging validates by default
        const consolidatedOptions = mergeFieldOptions(mergedOptions, {
          validate: mergeValidate(
            mergeValidate(baseOptions.validate, newDefaults.validate),
            passedOptions.validate
          ),
        })
        return new Field(consolidatedOptions)
      }
    )
    const myBetterMoneyField = BetterMoneyField({})
    const betterMoneyTester = new FieldTester(myBetterMoneyField)
    await betterMoneyTester.checkFieldMessage('$100', false)
    await betterMoneyTester.checkFieldMessage('€100', 'value must contain $')
    const messages = myBetterMoneyField.getMessages('€100000')
    expect(messages[0]).toMatchObject({
      level: 'warn',
      message: 'value must contain $',
      stage: 'validate',
    })
    expect(messages[1]).toMatchObject({
      level: 'warn',
      message: 'value must be less than 5 in length',
      stage: 'validate',
    })
  })

  test('makeField example with custom cast function', async () => {
    // test custom cast function
    const PercentageField = makeField(NumberField(), {
      // cast 50% and 0.5 to 0.5
      cast: (val: any) => {
        const stringVal = String(val).trim()
        let stringNumericalVal
        let multiplier
        if (stringVal.charAt(stringVal.length - 1) === '%') {
          stringNumericalVal = stringVal.substring(0, stringVal.length - 1)
          multiplier = 0.01
        } else {
          stringNumericalVal = stringVal
          multiplier = 1
        }
        let numericalVal = parseFloat(stringNumericalVal)
        if (isNaN(numericalVal)) {
          return null
        } else {
          return numericalVal * multiplier
        }
      },
    })
    const myPercentageField = PercentageField({})
    const percentageTester = new FieldTester(myPercentageField)
    await percentageTester.checkFieldResult('100%', 1)
    await percentageTester.checkFieldResult('52.5%', 0.525)
    await percentageTester.checkFieldResult('0.14', 0.14)
    await percentageTester.checkFieldResult(5, 5)
    await percentageTester.checkFieldResult('potato', null)
  })

  test('customizer', () => {
    //@ts-ignore
    const CustomizerField = makeField<number, { identityVal: number }>(
      NumberField({}),
      {},
      (mergedOptions, passedOptions) => {
        const cast = (val: any) => mergedOptions.identityVal as number
        const consolidatedOptions = mergeFieldOptions(mergedOptions, { cast })
        return new Field(consolidatedOptions)
      }
    )
    const instatiatedCustomizerField3 = CustomizerField({ identityVal: 3 })
    expect(instatiatedCustomizerField3.options.cast('asdf')).toBe(3)

    const instatiatedCustomizerField = CustomizerField({ identityVal: 5 })
    expect(instatiatedCustomizerField.options.cast('asdf')).toBe(5)
  })

  test('makeField examples with combined cast function', async () => {
    // test custom cast function
    const BooleanSynonymField = makeField<
      boolean,
      { trueSubstitutes: string[]; falseSubstitutes: string[] }
    >(BooleanField({}), {}, (mergedOptions, passedOptions) => {
      const trueSubstitutes = passedOptions.trueSubstitutes as string[]
      const falseSubstitutes = passedOptions.falseSubstitutes as string[]
      const cast = FallbackCast(
        SynonymCast(
          [
            [true, trueSubstitutes],
            [false, falseSubstitutes],
          ],
          (val) => `Couldn't convert '${val}' to a boolean`
        ),
        BooleanCast
      )

      //@ts-ignore //because of typing
      const consolidatedOptions = mergeFieldOptions(mergedOptions, { cast })
      return new Field(consolidatedOptions)
    })
    const bsynonym = BooleanSynonymField({
      trueSubstitutes: ['si', 'affirmative'],
      falseSubstitutes: ['nay', 'non'],
    })

    expect(bsynonym.getValue('si')).toBe(true)
    expect(bsynonym.getValue('nay')).toBe(false)
    //we preserve the existing functionality of interpretting "true" as true
    expect(bsynonym.getValue('true')).toBe(true)
    expect(bsynonym.getValue('foo')).toBe('foo')
  })
})
