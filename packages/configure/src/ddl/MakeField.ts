import _ from 'lodash'
import { BaseSchemaILFieldArgs } from '@flatfile/schema'

import {
  Field,
  IFieldHooks,
  FieldHookDefaults,
  Message,
  wrapValidate,
  FieldOnlyOptions,
} from './Field'

export const GenericDefaults: BaseSchemaILFieldArgs = {
  description: '',
  label: '',
  type: 'string',
  primary: false,
  required: false,
  unique: false,
  stageVisibility: {
    mapping: true,
    review: true,
    export: true,
  },
  annotations: {
    default: false,
    defaultMessage: 'This field was automatically given a default value of',
    compute: false,
    computeMessage: 'This value was automatically reformatted - original data:',
  },
  getSheetCompute: false,
  readonly: false,
}

const objCustomizer = (objValue: object, srcValue: object): object => {
  if (_.isFunction(srcValue)) {
    return srcValue
  }
  if (_.isObject(objValue)) {
    //@ts-ignore  nested merge being used in two ways here
    return nestedMerge(objValue, srcValue)
  } else {
    return srcValue
  }
}

const nestedMerge = (base: object, other: object): object =>
  _.mergeWith(_.cloneDeep(base), other, objCustomizer)

/*
 * mergeFieldOptions always guruantees that you'll get a full set of options to instantiate a field with
 * Some field options like `annotations` and `stageVisibility` are nested.
 * merge field options correctly deep merges them
 *
 * other overrides base
 */
export const mergeFieldOptions = <OperatingType>(
  base: FieldOnlyOptions<OperatingType>,
  other: Partial<FieldOnlyOptions<OperatingType>>
): FieldOnlyOptions<OperatingType> =>
  _.mergeWith(_.cloneDeep(base), other, objCustomizer)

/*
 * Use this for highly customized fields that will always require
 * custom passed in options, for which no reasonable default can be
 * provided.  Because named options are required, calling with string
 * only isn't valid
 */
export function makeField<
  T extends any,
  ExtraOptions extends Record<string, any> = {}
>(
  baseField: Field<T>,
  newDefaults: Partial<FieldOnlyOptions<T>> = {},
  customizer: (
    mergedOptions: FieldOnlyOptions<T> & ExtraOptions,
    extraUserOptions: Partial<FieldOnlyOptions<T>> & ExtraOptions,
    baseField: FieldOnlyOptions<T>,
    newDefaults: Partial<FieldOnlyOptions<T> & ExtraOptions>
  ) => Field<T> = (mergedOptions, ...args) => new Field(mergedOptions)
) {
  const fieldMaker = (
    newOptions: Partial<FieldOnlyOptions<T>> & ExtraOptions
  ): Field<T> => {
    const hookDefaults = FieldHookDefaults<T>()
    const typedBaseOpts: FieldOnlyOptions<T> = {
      ...GenericDefaults, // only needed because missing field key
      ...(hookDefaults as IFieldHooks<T>),
    }
    const baseMerged = mergeFieldOptions(typedBaseOpts, baseField.options)
    const baseMergedDefaults = mergeFieldOptions(baseMerged, newDefaults)
    const mergedBasePassed = mergeFieldOptions(baseMergedDefaults, newOptions)
    const field = customizer(
      mergedBasePassed,
      newOptions,
      baseMerged,
      newDefaults
    )
    return field
  }
  return fieldMaker
}

export function makeFieldLegacy<
  T extends any,
  ExtraOptions extends Record<string, any> = {}
>(
  // I think any is important, because we can't guaruntee the options
  // from the base field, it won't necessarily have the extra options
  // we have plastered on
  baseField: Field<T> | null,
  newDefaults: Partial<FieldOnlyOptions<T>> & ExtraOptions,
  customizer: (
    mergedOptions: FieldOnlyOptions<T> & ExtraOptions,
    passedInInstantionOptions: Partial<FieldOnlyOptions<T>> & ExtraOptions,
    //do I want to make this optional?  I really want it to be
    //optional for an implementing customizer function... makeField4
    //will always pass in the baseField
    baseField: FieldOnlyOptions<T>,
    newDefaults: Partial<FieldOnlyOptions<T>> & ExtraOptions
  ) => Field<T> = (mergedOptions, ...args) => new Field(mergedOptions)
) {
  const typedBaseStarter: FieldOnlyOptions<T> & ExtraOptions = {
    ...GenericDefaults,
    ...FieldHookDefaults<T>(),
  }
  const baseMergeOpts = baseField ? baseField.options : {}
  const typedBaseOpts = mergeFieldOptions(typedBaseStarter, baseMergeOpts)
  const baseOpts = mergeFieldOptions(typedBaseOpts, newDefaults)
  const fieldMaker = (
    newOptions:
      | (Partial<FieldOnlyOptions<T>> & ExtraOptions)
      | string = newDefaults
  ): Field<T> => {
    let normalizednewOptions: Partial<FieldOnlyOptions<T>> & ExtraOptions
    if (typeof newOptions === 'string') {
      //I don't know why I have to do this cast here,  newOptions is obviously a string at this point
      normalizednewOptions = {
        label: newOptions,
      } as Partial<FieldOnlyOptions<T>> & ExtraOptions
    } else {
      normalizednewOptions = newOptions
    }
    const mergedBasePassed = mergeFieldOptions(baseOpts, normalizednewOptions)
    const field = customizer(
      mergedBasePassed,
      normalizednewOptions,
      typedBaseOpts,
      newDefaults
    )
    return field
  }
  return fieldMaker
}

export const mergeValidate = <T>(
  validateF1: (value: T) => void | Message[],
  validateF2: undefined | ((value: T) => void | Message[])
) => {
  if (!validateF2) {
    return validateF1
  }
  const mergedValidateFunc = (value: T): void | Message[] => {
    return _.flatten([
      wrapValidate(validateF1)(value),
      wrapValidate(validateF2)(value),
    ])
  }
  return mergedValidateFunc
}
