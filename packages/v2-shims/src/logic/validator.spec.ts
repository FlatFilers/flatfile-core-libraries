import { Validator } from './validator'

describe('Validator', () => {
  describe('getFieldLabels', () => {
    it('should return corresponding labels for the keys', () => {
      const sheetConfig: any = {
        fields: [
          { key: 'name', label: 'Full Name' },
          { key: 'email', label: 'Email Address' },
        ],
      }
      const validator = new Validator(sheetConfig)
      expect(validator.getFieldLabels(['name', 'email'])).toEqual([
        'Full Name',
        'Email Address',
      ])
    })

    it('should return the key if label is not found', () => {
      const sheetConfig: any = {
        fields: [{ key: 'name', label: 'Full Name' }],
      }
      const validator = new Validator(sheetConfig)
      expect(validator.getFieldLabels(['name', 'age'])).toEqual([
        'Full Name',
        'age',
      ])
    })
  })

  describe('getFieldValidators', () => {
    it('should return validators for a given key', () => {
      const sheetConfig: any = {
        fields: [
          {
            key: 'name',
            metadata: { v2_validators: [{ validate: 'required' }] },
          },
        ],
      }
      const validator = new Validator(sheetConfig)
      expect(validator.getFieldValidators('name')).toEqual([
        { validate: 'required' },
      ])
    })

    it('should return undefined if no validators found', () => {
      const sheetConfig: any = {
        fields: [{ key: 'name' }],
      }
      const validator = new Validator(sheetConfig)
      expect(validator.getFieldValidators('age')).toBeUndefined()
    })
  })

  describe('validateCell', () => {
    it('should throw an error for unsupported validators', () => {
      const sheetConfig: any = {
        fields: [
          {
            key: 'name',
            metadata: { v2_validators: [{ validate: 'select' }] },
          },
        ],
      }
      const validator = new Validator(sheetConfig)
      expect(() => validator.validateCell({ name: 'John' }, 'name')).toThrow(
        '`select` validator is no longer necessary. Remove this.'
      )
    })
  })

  describe('validateCell Scenarios', () => {
    let sheetConfig: any
    let validator: Validator

    beforeEach(() => {
      // A basic configuration can be provided here.
      sheetConfig = {
        fields: [],
      }
      validator = new Validator(sheetConfig)
    })

    it('should validate "required_without_all" scenario correctly', () => {
      sheetConfig.fields = [
        {
          key: 'name',
          metadata: {
            v2_validators: [
              { validate: 'required_without_all', fields: ['age', 'address'] },
            ],
          },
        },
      ]
      validator = new Validator(sheetConfig)
      // Should be invalid as 'name' is empty and both 'age' and 'address' are empty
      expect(validator.validateCell({}, 'name')).toEqual([
        'This field is required when ALL of the following fields are empty: age, address',
      ])
      // Should be valid as 'name' is provided
      expect(validator.validateCell({ name: 'John' }, 'name')).toEqual([])
    })

    it('should validate "required_without" scenario correctly', () => {
      sheetConfig.fields = [
        {
          key: 'name',
          metadata: {
            v2_validators: [
              { validate: 'required_without', fields: ['age', 'address'] },
            ],
          },
        },
      ]
      validator = new Validator(sheetConfig)
      // Should be invalid as 'name' is empty and 'age' is empty
      expect(
        validator.validateCell({ address: 'Street 123' }, 'name')
      ).toContain(
        'This field is required when ANY of the following fields are empty: age, address'
      )
      // Should be valid as 'name' is provided
      expect(
        validator.validateCell({ name: 'John', address: 'Street 123' }, 'name')
      ).toEqual([])
    })

    it('should validate "required_with_all" scenario correctly', () => {
      sheetConfig.fields = [
        {
          key: 'name',
          metadata: {
            v2_validators: [
              { validate: 'required_with_all', fields: ['age', 'address'] },
            ],
          },
        },
      ]
      validator = new Validator(sheetConfig)
      // Should be invalid as 'name' is empty but both 'age' and 'address' are provided
      expect(
        validator.validateCell({ age: 25, address: 'Street 123' }, 'name')
      ).toContain(
        'This field is required when ALL of the following fields are filled: age, address'
      )
      // Should be valid as 'name' is provided
      expect(
        validator.validateCell(
          { name: 'John', age: 25, address: 'Street 123' },
          'name'
        )
      ).toEqual([])
    })

    it('should validate "required_with" scenario correctly', () => {
      sheetConfig.fields = [
        {
          key: 'name',
          metadata: {
            v2_validators: [
              { validate: 'required_with', fields: ['age', 'address'] },
            ],
          },
        },
      ]
      validator = new Validator(sheetConfig)
      // Should be invalid as 'name' is empty but 'address' is provided
      expect(
        validator.validateCell({ address: 'Street 123' }, 'name')
      ).toContain(
        'This field is required when ANY of the following fields are filled: age, address'
      )
      // Should be valid as 'name' is provided
      expect(
        validator.validateCell({ name: 'John', address: 'Street 123' }, 'name')
      ).toEqual([])
    })

    it('should validate "regex_matches" scenario correctly', () => {
      sheetConfig.fields = [
        {
          key: 'name',
          metadata: {
            v2_validators: [
              {
                validate: 'regex_matches',
                regex: '^John$',
                regexFlags: { ignoreCase: true },
              },
            ],
          },
        },
      ]
      validator = new Validator(sheetConfig)
      // Should be valid as the name matches the regex pattern
      expect(validator.validateCell({ name: 'John' }, 'name')).toEqual([])
      // Should be invalid as the name doesn't match the regex pattern
      expect(validator.validateCell({ name: 'Doe' }, 'name')).toEqual([
        'Failed validation',
      ])
    })

    it('should validate "regex_excludes" scenario correctly', () => {
      sheetConfig.fields = [
        {
          key: 'name',
          metadata: {
            v2_validators: [
              {
                validate: 'regex_excludes',
                regex: '^John$',
                regexFlags: { ignoreCase: true },
              },
            ],
          },
        },
      ]
      validator = new Validator(sheetConfig)
      // Should be valid as the name doesn't contain the excluded pattern
      expect(validator.validateCell({ name: 'Doe' }, 'name')).toEqual([])
      // Should be invalid as the name matches the excluded pattern
      expect(validator.validateCell({ name: 'John' }, 'name')).toEqual([
        'Failed validation',
      ])
    })
  })
})
