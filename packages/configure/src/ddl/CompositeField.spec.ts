import { ComputedField } from './ComputedField'
import { WorkbookTester } from './WorkbookTester'

import { NumberField } from '@flatfile/configure'
import {
  CartesianPointField,
  makeCompositeField,
  ComplexType,
  CartesianPoint,
} from './CompositeField'
import { Sheet } from './Sheet'
import { keys } from 'remeda'

describe.only('compositeField ->', () => {
  test('CartesianPoint works', () => {
    const Origin = new CartesianPoint(0, 0)
    const FiveAway = new CartesianPoint(3, 4) // form a 3,4, 5 triangle
    expect(Origin.distance(FiveAway)).toBe(5)
  })

  test('CompositeField an be instantiated', () => {
    const cpf = CartesianPointField('from', { prefix: true })
    expect(keys(cpf.extraFieldsToAdd)).toMatchObject(['from_x', 'from_y'])
  })

  test('CompositeField can be instantiated without a prefix', () => {
    const cpf = CartesianPointField('from', { prefix: false })
    expect(keys(cpf.extraFieldsToAdd)).toMatchObject(['x', 'y'])
    const cpf2 = CartesianPointField('from')
    expect(keys(cpf2.extraFieldsToAdd)).toMatchObject(['x', 'y'])
  })

  test('Sheet rejects  adds the right properties to a Sheet', () => {
    const SheetWithComposite = new Sheet('SheetWithComposite', {
      from: CartesianPointField('from', { prefix: true }),
    })
    expect(keys(SheetWithComposite.fields)).toMatchObject([
      'from',
      'from_x',
      'from_y',
    ])
  })

  test('Sheet throws an error when the same extras are added ', () => {
    const NumberFieldWithSameExtras = NumberField({})
    NumberFieldWithSameExtras.extraFieldsToAdd = { extra: NumberField({}) }
    const flawedSheetConstruction = () => {
      const SheetWithComposite = new Sheet('SheetWithComposite', {
        a: NumberFieldWithSameExtras,
        b: NumberFieldWithSameExtras,
      })
    }
    //TODO  add tests for an extraFieldsToAdd that is the name of a fully named key
    expect(flawedSheetConstruction).toThrow(
      `Attemped to add field 'extra' twice to the same Sheet. Sheets cannot contain duplicate fields.`
    )
  })

  test('compositeField works simply', async () => {
    const TestSchema = new WorkbookTester(
      {
        from: CartesianPointField('from', { prefix: true }),
      },
      {}
    )
    const rawData = { from_x: 0, from_y: 0, from: 'blank' }
    const expectedOutput = {
      from_x: 0,
      from_y: 0,
    }
    await TestSchema.checkRowResult({
      rawData,
      expectedOutput,
    })
  })

  test('constructed compositeField works', async () => {
    const TestSchema = new WorkbookTester(
      {
        from: CartesianPointField('from', { prefix: true }),
        to: CartesianPointField('to', { prefix: true }),
        distance: ComputedField(NumberField({ required: false }), {
          dependsOn: ['from', 'to'],
          compute: (rec: Record<string, any>) => {
            const fromLoc = rec['from'] as CartesianPoint
            const to = rec['to'] as CartesianPoint
            return fromLoc.distance(to)
          },
          destination: 'distance',
        }),
      },
      {}
    )
    await TestSchema.checkRowResult({
      rawData: {
        from_x: 0,
        from_y: 0,
        to_x: 3,
        to_y: 4,
        distance: 0,
        from: 'blank for record',
        to: 'blank for record',
      },
      expectedOutput: {
        from_x: 0,
        from_y: 0,
        to_x: 3,
        to_y: 4,
        // HERE we computed distance
        distance: 5,
      },
    })
  })

  test('compositeField understands requried:true/false for extra fields', async () => {
    class AorB extends ComplexType {
      constructor(public readonly a: number, public readonly b: number) {
        super()
        //this is a hack, we can clean it up later
        this.useToValue = true
      }

      static fields = {
        a: NumberField({ required: true }),
        b: NumberField({ required: false }),
      }

      // TODO: how to specify the type and shape of the incoming obj
      static fromRecord(obj: any) {
        const a = obj.a as number
        const b = obj.b as number
        return new AorB(a, b)
      }

      public toValue() {
        if (this.b === null) {
          return "b wasn't there"
        } else {
          return 'a and b present'
        }
      }
    }

    const AorBField = makeCompositeField(AorB)

    const TestSchema = new WorkbookTester(
      {
        ab: AorBField('ab', { prefix: true }),
      },
      {}
    )
    await TestSchema.checkRowResult({
      rawData: { ab_a: 5, ab_b: 8, ab: '' },
      expectedOutput: { ab_a: 5, ab_b: 8, ab: 'a and b present' },
    })
    await TestSchema.checkRowResult({
      rawData: { ab_a: 5, ab_b: null, ab: '' },
      expectedOutput: { ab_a: 5, ab_b: null, ab: "b wasn't there" },
    })
  })
})
