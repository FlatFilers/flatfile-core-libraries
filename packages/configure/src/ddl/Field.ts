import { pick, mapValues, keys } from 'remeda'
import {
  SchemaILField,
  BaseSchemaILField,
  LinkedSheetField,
  ReferenceField,
  SchemaILEnumField,
  SchemaILFieldArgs,
} from '@flatfile/schema'
import { isFullyPresent } from '../utils/isFullyPresent'
import _ from 'lodash'

export type TRecordStageLevel =
  | 'cast'
  | 'required'
  | 'compute'
  //  | 'computedField'  // not sure about this
  | 'validate'
  | 'apply'
  | 'other'

type TRecordLevel = 'error' | 'warn' | 'info'

class Value<T> {
  constructor(
    public readonly value: T,
    public readonly meta: Record<any, any>
  ) {}
}

export class Message {
  constructor(
    public readonly message: string,
    public readonly level: TRecordLevel = 'info',
    public readonly stage: TRecordStageLevel
  ) {}
}
export type Dirty<T> = string | null | T
export type Nullable<T> = null | T
export type Waitable<T> = T
export type Writable<T> = Waitable<T | Value<T>>

export interface IFieldHooks<T> {
  cast: (value: Dirty<T>) => Nullable<T>
  default: Nullable<T>
  compute: (value: T) => T
  validate: (value: T) => void | Message[] // eventually add single message
  egressFormat: ((value: T) => string) | false
}

export interface IExtraFieldOptions {
  allowDataLoss?: boolean
}

export type AnyField = Field<any>

export const FieldHookDefaults = <T>(): IFieldHooks<T> => ({
  cast: (value: Dirty<T>) => {
    if (value != null) {
      return value as T
    }
    return null
  },
  default: null,
  compute: (value: T) => value,
  validate: () => [],
  egressFormat: false,
})

export const wrapValidate = <T>(
  valFunc: (value: T) => void | Message[]
): ((value: T) => Message[]) => {
  const wrappedValidateFunc = (value: T): Message[] => {
    try {
      const val1Result = valFunc(value)
      if (val1Result === undefined) {
        return []
      } else return val1Result
    } catch (e: any) {
      return [new Message(e.toString(), 'error', 'validate')]
    }
  }
  return wrappedValidateFunc
}

export const verifyEgressCycle = <T>(field: Field<T>, castVal: T): boolean => {
  //cast / egressFormat cycle must converge to the same value,
  //otherwise throw an error because the user will lose dta
  const ef = field.options.egressFormat
  if (ef === false) {
    return true
  }
  const egressResult = ef(castVal)
  const recastResult = field.toCastDefault(egressResult)
  const recast = recastResult[0]

  // We want to be very explicit about date comparison since it is so important
  if (_.isDate(castVal) && _.isDate(recast)) {
    const [castDate, recastDate] = [castVal as Date, recast as Date]
    if (_.isEqual(castDate, recastDate)) {
      //explicitly returning true so we get to the console.log with better debugging info
      return true
    }
  }
  if (_.isEqual(castVal, recast)) {
    return true
  }

  return castVal === recast
}

export type FieldOnlyOptions<T> = SchemaILFieldArgs &
  IFieldHooks<T> &
  IExtraFieldOptions

export class Field<T, Unused extends Record<string, any> = {}> {
  public constructor(public options: FieldOnlyOptions<T>) {}

  // leaving this as a public field and not adding it to the default
  // constructor because this is a very advanced field feature to use,
  // it can be set on an instantiated field

  public extraFieldsToAdd: Record<string, AnyField> = {}

  public toCastDefault(rawValue: any): [Nullable<T>, Message[]] {
    // run field execution until a value or null is provided, run with proper error and type handling
    const extraMessages: Message[] = []
    const possiblyCast = this.options.cast(rawValue)
    if (typeof possiblyCast === 'undefined') {
      throw new Error(
        `There was an error when processing value '${rawValue}'. The field attempted to cast '${rawValue}' to 'undefined'.`
      )
    }
    let actuallyCast: Nullable<T>
    if (!isFullyPresent(possiblyCast) && isFullyPresent(this.options.default)) {
      if (this.options.annotations.default) {
        extraMessages.push(
          new Message(
            `${this.options.annotations.defaultMessage} '${this.options.default}'`,
            'info',
            'other'
          )
        )
      }
      actuallyCast = this.options.default
    } else {
      actuallyCast = possiblyCast
    }
    return [actuallyCast, extraMessages]
  }

  public computeFromValue(
    reallyActuallyCast: T,
    rawValue: any
  ): [Nullable<T>, Message[]] {
    // start with an actual value of correct type, call compute with proper error handling, pull off computed value and messages
    if (!this.options.allowDataLoss) {
      let egressFail: boolean = false
      try {
        egressFail =
          this.options.egressFormat &&
          !verifyEgressCycle(this, reallyActuallyCast)
      } catch (e: any) {
        throw new Error(
          `There was an error when processing value ${rawValue}. The field threw an error when trying to write the final value to the cell.`
        )
      }
      if (this.options.egressFormat && egressFail) {
        const egressVal = this.options.egressFormat(reallyActuallyCast)
        console.log(`egressVal: ${egressVal}`)
        throw new Error(
          `There was an error when processing value '${rawValue}'. The result was '${egressVal}', which constitutes a loss of data. If '${egressVal}' is the correct result, you can fix this error by entering '${egressVal}' into this cell.`
        )
      }
    }

    const compMessages: Message[] = []
    const computed: T = this.options.compute(reallyActuallyCast)
    if (typeof computed === 'undefined') {
      throw new Error(
        `There was an error when processing value '${rawValue}'. The field attempted to compute ${rawValue} to 'undefined'.`
      )
    }
    if (reallyActuallyCast !== computed && this.options.annotations.compute) {
      compMessages.push(
        new Message(
          `${this.options.annotations.computeMessage} '${reallyActuallyCast}'`,
          'info',
          'other'
        )
      )
    }
    return [computed, compMessages]
  }

  public computeToValue(rawValue: any): [Nullable<T>, Message[]] {
    //execute the `toCastDefault` and `computeFromValue` functions with proper execption handling
    try {
      const [actuallyCast, extraMessages] = this.toCastDefault(rawValue)
      if (isFullyPresent(actuallyCast)) {
        try {
          const reallyActuallyCast: T = actuallyCast as T
          const [computed, compMessages] = this.computeFromValue(
            reallyActuallyCast,
            rawValue
          )
          return [computed, _.concat(extraMessages, compMessages)]
        } catch (e: any) {
          return [
            rawValue,
            _.concat(
              extraMessages,
              new Message(e.toString(), 'error', 'compute')
            ),
          ]
        }
      } else {
        if (this.options.required) {
          return [null, extraMessages]
        }
        return [null, []]
      }
    } catch (e: any) {
      return [rawValue, [new Message(e.toString(), 'error', 'cast')]]
    }
  }

  public validate(val: T) {
    try {
      return this.options.validate(val)
    } catch (e: any) {
      return [new Message(e.toString(), 'error', 'validate')]
    }
  }

  public getValue(rawValue: Dirty<T>) {
    return this.computeToValue(rawValue)[0]
  }

  public getMessages(rawValue: Nullable<T>) {
    const [computedVal, messages] = this.computeToValue(rawValue)
    if (computedVal === null) {
      return messages
    }
    const validateMessages = wrapValidate((val) => this.validate(computedVal))(
      computedVal
    )
    return _.flatten([messages, validateMessages])
  }

  public toSchemaILField(fieldName: string, namespace?: string): SchemaILField {
    const t = this.options.type
    const base = {
      field: fieldName,
      label: this.options.label || fieldName,
      readonly: this.options.readonly,
      annotations: {},
      blueprint: this.options.blueprint,
      ...pick(this.options, [
        'description',
        'required',
        'primary',
        'unique',
        'stageVisibility',
      ]),
    }

    if (
      t === 'string' ||
      t === 'number' ||
      t === 'composite' ||
      t === 'boolean'
    ) {
      const baseField: BaseSchemaILField = {
        ...base,
        type: t,
      }
      return baseField
    } else if (t === 'schema_ref') {
      const linkedOptions = this.options //as LinkedSheetField
      const LinkedField: LinkedSheetField = {
        ...base,
        type: t,
        upsert: linkedOptions.upsert,
        sheetName: linkedOptions.sheetName,
      }
      return LinkedField
    } else if (t === 'reference') {
      const linkedOptions = this.options //as LinkedSheetField
      const RefField: ReferenceField = {
        ...base,
        type: t,
        sheetKey: namespace
          ? `${namespace}/${linkedOptions.sheetKey}`
          : linkedOptions.sheetKey,
        foreignKey: linkedOptions.foreignKey,
        relationship: linkedOptions.relationship,
      }
      return RefField
    } else if (t === 'enum') {
      const EnumField: SchemaILEnumField = {
        type: t,
        ...base,
        ...pick(this.options, ['labelEnum', 'matchStrategy']),
      }
      return EnumField
    } else {
      throw new Error(
        `Attempted to create a field with type ${t}, which is not supported.`
      )
    }
  }

  public contributeToSchemaILFBase() {
    //add whatever pieces this field needs to add to the base sheet
    //definition, possible additonal processing at the Sheet level
  }
}
