import { IFieldOptionDictionary, ISettings, IValidator } from '../types'

/**
 * Convert v2 Configuration to modern Blueprint
 *
 * @param schema
 */
export const configToBlueprint = (schema: ISettings): BlueprintOutput => {
  let fields: INewField[] = []
  fields = schema.fields.map((field) => {
    let out: INewField = {
      key: field.key,
      label: field.label || field.key,
      type: PlatformTypes.String,
      constraints: [],
    }

    if (field.description) {
      out.description = field.description
    }

    if (field.type) {
      if (field.type === 'checkbox') {
        out.type = PlatformTypes.Bool
      }
      if (field.type === 'select') {
        out.type = PlatformTypes.Enum
        out.config = { options: field.options }
      }
    }
    if (field.validators) {
      field.validators.forEach((validator: IValidator) => {
        if (validator.validate === 'required') {
          out.constraints.push({ type: 'required' })
        } else if (validator.validate === 'unique') {
          out.constraints.push({ type: 'unique' })
        } else {
          if (!out?.metadata?.v2_validators) {
            out.metadata = {}
            out.metadata.v2_validators = [validator]
          } else {
            out.metadata.v2_validators.push(validator)
          }
        }
      })
    }
    return out
  })

  return {
    name: schema?.type || 'No name provided',
    sheets: [
      {
        name: schema?.type || 'No sheet name',
        slug: schema?.type || 'sheetSlug',
        fields: fields,
      },
    ],
    actions: [
      {
        operation: 'submitAction',
        mode: 'foreground',
        label: 'Submit',
        description: 'Submit action for data egress',
        primary: true,
      },
    ],
  }
}

export enum PlatformTypes {
  String = 'string',
  Num = 'number',
  Date = 'date',
  Enum = 'enum',
  Bool = 'boolean',
  Ref = 'reference',
}

type Constraint = {
  // these are the only 2 for conversion purposes
  type: 'unique' | 'required'
}

type Config = {
  options?: IFieldOptionDictionary[]
}

type INewField = {
  key: string
  label: string
  type: PlatformTypes
  description?: string
  config?: Config
  constraints: Constraint[]
  metadata?: { v2_validators?: IValidator[] }
}

type SheetOutput = {
  name: string
  slug: string
  fields: INewField[]
}

type ActionOutput = {
  operation: string
  mode: 'foreground' | 'background'
  label: string
  description: string
  primary: boolean
}

type BlueprintOutput = {
  name: string
  sheets: SheetOutput[]
  actions: ActionOutput[]
}
