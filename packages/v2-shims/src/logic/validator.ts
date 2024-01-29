import type {
  IPrimitive,
  IValidationResponse,
  Nullable,
  Scalar,
  ScalarDictionary,
} from '../types/general.interface'
import type { IValidator } from '../types/settings.interface'
import { getRegexFlags, isEmpty, memo, testRegex } from './util'
import type { SheetConfig } from '@flatfile/api/api'

const getRegexFlagsMemo = memo(getRegexFlags)

export class Validator {
  // tslint:disable-next-line:no-any
  constructor(private sheet: SheetConfig) {}

  public getFieldLabels(keys: string[]): string[] {
    const keyToLabel: Record<string, string> = {}

    this.sheet.fields.forEach((item) => {
      if (item.label) {
        keyToLabel[item.key] = item.label
      }
    })

    return keys.map((key) => (key in keyToLabel ? keyToLabel[key] : key))
  }

  /**
   * Get legacy validators if they're available
   *
   * @param key
   */
  public getFieldValidators(key: string): IValidator[] | undefined {
    return this.sheet.fields.find((f) => f.key === key)?.metadata?.v2_validators
  }

  /**
   * Take a simple key/value pair and return an array of any errors detected
   *
   * @param row
   */
  public validateRow(row: ScalarDictionary): IValidationResponse[] {
    const validations = Object.keys(row).map((key) => {
      const errors = this.validateCell(row, key)

      return errors.map((message) => ({
        key,
        level: 'error' as const,
        message,
      }))
    })

    return validations.flat()
  }

  /**
   * Backwards compatible helper
   *
   * @todo remove this
   * @param row
   * @param key
   * @private
   */
  private getRowValue(
    row: ScalarDictionary,
    key: string
  ): Nullable<IPrimitive> {
    return row[key]
  }

  public validateCell(row: ScalarDictionary, key: string): string[] {
    const value = this.getRowValue(row, key)

    const validators = this.getFieldValidators(key) || []

    const requiredValidatorKeys = [
      'required_without',
      'required_without_all',
      'required_with_all',
      'required_with',
      'required_without_values',
      'required_without_all_values',
      'required_with_all_values',
      'required_with_values',
    ]

    const requiredValidators = validators.filter((validator) =>
      requiredValidatorKeys.includes(validator.validate)
    )

    const requiredErrors = requiredValidators.reduce((errors, validator) => {
      let isValid = true

      switch (validator.validate) {
        case 'required_without_all':
          // required when all of the fields are empty
          // i.e. allow empty when any field is non empty
          isValid =
            !isEmpty(value) ||
            validator.fields.some((v) => !isEmpty(this.getRowValue(row, v)))
          break
        case 'required_without':
          // required when any of the fields are empty
          // i.e. allow empty when all fields are non empty
          isValid =
            !isEmpty(value) ||
            !validator.fields.some((v) => isEmpty(this.getRowValue(row, v)))
          break
        case 'required_with_all':
          // required when all of the fields are non empty
          // i.e. allow empty when any field is empty
          isValid =
            !isEmpty(value) ||
            validator.fields.some((v) => isEmpty(this.getRowValue(row, v)))
          break
        case 'required_with':
          // required when any of the fields are non empty
          // i.e. allow empty when all fields are empty
          isValid =
            !isEmpty(value) ||
            !validator.fields.some((v) => !isEmpty(this.getRowValue(row, v)))
          break
        case 'required_without_all_values':
          isValid =
            !isEmpty(value) ||
            // required when all of the fields are mismatched
            // i.e. allow empty when any field is matched
            this.someFields(
              validator.fieldValues,
              (expected, cellValue) =>
                Array.isArray(expected)
                  ? expected.includes(cellValue)
                  : expected === cellValue,
              row
            )
          break
        case 'required_without_values':
          isValid =
            !isEmpty(value) ||
            // required when any of the fields are mismatched
            // i.e. allow empty when all fields are matched
            !this.someFields(
              validator.fieldValues,
              (expected, cellValue) =>
                Array.isArray(expected)
                  ? !expected.includes(cellValue)
                  : expected !== cellValue,
              row
            )
          break
        case 'required_with_all_values':
          isValid =
            !isEmpty(value) ||
            // required when all of the fields are matched
            // i.e. allow empty when any field is mismatched
            this.someFields(
              validator.fieldValues,
              (expected, cellValue) =>
                Array.isArray(expected)
                  ? !expected.includes(cellValue)
                  : expected !== cellValue,
              row
            )
          break
        case 'required_with_values':
          isValid =
            !isEmpty(value) ||
            // required when any of the fields are matched
            // i.e. allow empty when all fields are mismatched
            !this.someFields(
              validator.fieldValues,
              (expected, cellValue) =>
                Array.isArray(expected)
                  ? expected.includes(cellValue)
                  : expected === cellValue,
              row
            )
          break
        default:
          // tslint:disable-next-line:no-console
          console.error(`unhandled required validator: ${validator.validate}`)
      }

      return isValid
        ? errors
        : errors.concat([
            validator.error ||
              this.defaultErrorMessage(validator) ||
              'Failed validation',
          ])
    }, [] as string[])

    const additionalValidators = validators.filter(
      (validator) => !requiredValidatorKeys.includes(validator.validate)
    )

    const additionalErrors = additionalValidators.reduce(
      (errors, validator) => {
        let isValid = true

        switch (validator.validate) {
          case 'regex_matches':
            isValid = testRegex(
              validator.regex,
              validator.regexFlags
                ? getRegexFlagsMemo(validator.regexFlags)
                : '',
              value
            )
            break
          case 'regex_excludes':
            isValid = !testRegex(
              validator.regex,
              validator.regexFlags
                ? getRegexFlagsMemo(validator.regexFlags)
                : '',
              value,
              false
            )
            break
          case 'select':
            throw new Error(
              '`select` validator is no longer necessary. Remove this.'
            )
          default:
            // tslint:disable-next-line:no-console
            console.error(`unhandled validator: ${validator.validate}`)
        }

        return isValid
          ? errors
          : errors.concat([
              validator.error ||
                this.defaultErrorMessage(validator) ||
                'Failed validation',
            ])
      },
      [] as string[]
    )

    if (isEmpty(value) && requiredErrors.length === 0) {
      return []
    }
    return requiredErrors.concat(additionalErrors)
  }

  /**
   * check some fields against an expectation i.e. { "key": "value" } // i.e. row["key"] === "value"
   * @param expectedFields
   * @param rule
   * @param row
   */
  private someFields(
    expectedFields: ScalarDictionary,
    rule: (expected: Scalar, value: Scalar) => boolean,
    row: ScalarDictionary
  ) {
    return Object.keys(expectedFields).some((fieldKey) =>
      rule(expectedFields[fieldKey], this.getRowValue(row, fieldKey))
    )
  }

  private defaultErrorMessage(validator: IValidator): string | void | null {
    const messages = {
      required_with:
        'This field is required when ANY of the following fields are filled: {{fields}}',
      required_with_all:
        'This field is required when ALL of the following fields are filled: {{fields}}',
      required_with_all_values:
        'This field is required when ALL of the following fields have these values: {{fields}}',
      required_with_values:
        'This field is required when ANY of the following fields have these values: {{fields}}',
      required_without:
        'This field is required when ANY of the following fields are empty: {{fields}}',
      required_without_all:
        'This field is required when ALL of the following fields are empty: {{fields}}',
      required_without_all_values:
        'This field is required when NONE of the following fields have these values: {{fields}}',
      required_without_values:
        "This field is required when ANY of the following fields don't have these values: {{fields}}",
      unique: 'Must be unique.',
    }
    switch (validator.validate) {
      case 'required_with':
      case 'required_with_all':
      case 'required_without':
      case 'required_without_all':
        return messages[validator.validate].replace(
          '{{fields}}',
          this.getFieldLabels(validator.fields).join(', ')
        )
      case 'required_with_values':
      case 'required_with_all_values':
      case 'required_without_values':
      case 'required_without_all_values':
        const labels = this.getFieldLabels(Object.keys(validator.fieldValues))
        const requiredString = Object.values(validator.fieldValues)
          .map(
            (value, index) =>
              `"${labels[index]}"${
                Array.isArray(value)
                  ? ` any of [${value.map((v) => `"${v}"`).join(', ')}]`
                  : ` = "${value}"`
              }`
          )
          .join(', ')
        return messages[validator.validate].replace(
          '{{fields}}',
          requiredString
        )
    }
  }
}
