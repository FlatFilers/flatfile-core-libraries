import { PlatformTypes, configToBlueprint } from './config.to.blueprint'
import { ISettings } from '../types' // Update the path accordingly

describe('v2ConfigToBlueprint', () => {
  it('should handle basic field conversion', async () => {
    const input = {
      type: 'Sample',
      fields: [
        {
          key: 'sampleKey',
          label: 'sampleLabel',
        },
      ],
    }

    const result = await configToBlueprint(input)

    expect(result).toEqual({
      name: 'Sample',
      sheets: [
        {
          name: 'Sample',
          slug: 'Sample',
          fields: [
            {
              key: 'sampleKey',
              label: 'sampleLabel',
              type: PlatformTypes.String,
              constraints: [],
            },
          ],
        },
      ],
      actions: [
        {
          description: 'Submit action for data egress',
          label: 'Submit',
          mode: 'foreground',
          operation: 'submitAction',
          primary: true,
        },
      ],
    })
  })

  it('should handle field description', async () => {
    const input = {
      type: 'Sample',
      fields: [
        {
          key: 'sampleKey',
          label: 'sampleLabel',
          description: 'sampleDescription',
        },
      ],
    }

    const result = await configToBlueprint(input)

    expect(result.sheets[0].fields[0].description).toBe('sampleDescription')
  })

  it('should convert checkbox field type to boolean', async () => {
    const input: ISettings = {
      type: 'Sample',
      fields: [
        {
          key: 'sampleKey',
          label: 'sampleLabel',
          type: 'checkbox',
        },
      ],
    }

    const result = await configToBlueprint(input)

    expect(result.sheets[0].fields[0].type).toBe(PlatformTypes.Bool)
  })

  it('should convert select field type to enum and handle options', async () => {
    const input: ISettings = {
      type: 'Sample',
      fields: [
        {
          key: 'sampleKey',
          label: 'sampleLabel',
          type: 'select',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        },
      ],
    }

    const result = await configToBlueprint(input)

    expect(result.sheets[0].fields[0].type).toBe(PlatformTypes.Enum)
    expect(result.sheets[0].fields[0].config?.options).toEqual([
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ])
  })

  it('should handle validators and constraints', async () => {
    const input: ISettings = {
      type: 'Sample',
      fields: [
        {
          key: 'sampleKey',
          label: 'sampleLabel',
          validators: [
            { validate: 'required' },
            { validate: 'unique' },
            { validate: 'required_with', fields: ['otherKey'] },
            { validate: 'regex_matches', regex: '[a-z]+' },
          ],
        },
      ],
    }

    const result = await configToBlueprint(input)
    const field = result.sheets[0].fields[0]

    expect(field.constraints).toEqual([
      { type: 'required' },
      { type: 'unique' },
    ])
    expect(field.metadata?.v2_validators).toEqual([
      { validate: 'required_with', fields: ['otherKey'] },
      { validate: 'regex_matches', regex: '[a-z]+' },
    ])
  })

  // You can also add negative tests, like testing how the function behaves with invalid input
})
