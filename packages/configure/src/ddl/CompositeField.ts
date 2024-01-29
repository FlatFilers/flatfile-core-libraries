import { TPrimitive } from '@flatfile/hooks'
import { AnyField } from './Field'
import { TextField, NumberField } from '../fields'
import { ComputedField } from './ComputedField'
import { toPairs } from 'remeda'

export class ComplexType {
  static fields: Record<string, AnyField> = {}
  static fromRecord(obj: any): any {
    return null
  }
  public useToValue = false
  public toValue(): TPrimitive {
    // this is a hack
    return '_'
  }
}

export interface CompositeFieldOptions {
  prefix?: boolean // should the extra fields be prefixed, defaults to false
}

export const DefaultCompositeFieldOptions: CompositeFieldOptions = {
  prefix: false,
}

//  I want a Template Type T such that T = the class of CartesianPoint

export function makeCompositeField(someClass: any): any {
  const internalCompField = (
    targetName: string,
    passedOptions: CompositeFieldOptions
  ) => {
    //todo: write toSchemaIL for CompositeField
    const options = { ...DefaultCompositeFieldOptions, ...passedOptions }
    const extraFieldsToAdd: Record<string, AnyField> = {}
    const unMapRecord: Record<string, string> = {}
    const classFields = someClass.fields as Record<string, AnyField>

    const dependsOn: string[] = []
    const possiblyDependsOn: string[] = []
    const keyPrefix = options.prefix ? `${targetName}_` : ''
    toPairs(classFields).map(([extraKey, extraField]) => {
      const fullKey = keyPrefix + extraKey

      extraFieldsToAdd[fullKey] = extraField
      if (extraField.options.required) {
        dependsOn.push(fullKey)
      } else {
        possiblyDependsOn.push(fullKey)
      }

      // use for deconstructing the record later
      unMapRecord[fullKey] = extraKey
    })
    const destinationField = ComputedField(
      // using TextField here because we have to fake something
      TextField({ required: false }),
      {
        dependsOn,
        possiblyDependsOn,
        compute: (rec: Record<string, TPrimitive>) => {
          const limitedObj: Record<string, any> = {}
          toPairs(unMapRecord).map(([fullKey, recordKey]) => {
            if (fullKey === null) {
              return // type guard
            }
            limitedObj[recordKey] = rec[fullKey]
          })
          const firstVal = someClass.fromRecord(limitedObj)
          if (firstVal.useToValue) {
            return firstVal.toValue()
          } else {
            return firstVal
          }
        },
        destination: targetName,
      }
    )
    destinationField.extraFieldsToAdd = extraFieldsToAdd

    return destinationField
  }
  return internalCompField
}

export class CartesianPoint extends ComplexType {
  constructor(public readonly x: number, public readonly y: number) {
    super()
  }

  public distance(otherPoint: CartesianPoint): number {
    const xDist = this.x - otherPoint.x
    const yDist = this.y - otherPoint.y
    return Math.sqrt(xDist * xDist + yDist * yDist)
  }

  static fields = { x: NumberField(), y: NumberField() }

  // TODO: how to specify the type and shape of the incoming obj
  static fromRecord(obj: any) {
    const x = obj.x as number
    const y = obj.y as number
    return new CartesianPoint(x, y)
  }
}

export const CartesianPointField = makeCompositeField(CartesianPoint)
