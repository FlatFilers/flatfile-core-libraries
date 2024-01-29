import { WorkbookTester } from './WorkbookTester'
import { isFullyPresent } from '../utils/isFullyPresent'
import { TextField } from '../fields'
import { makeCompositeField, ComplexType } from './CompositeField'

export class Name extends ComplexType {
  constructor(
    public readonly first_name: string,
    public readonly last_name: string,
    public readonly fullname: string
  ) {
    super()
    if (fullname === null) {
      if (isFullyPresent(first_name) && isFullyPresent(last_name)) {
        this.fullname = `${first_name} ${last_name}`
      } else {
        throw new Error(
          `not enough defined for name first_name ${first_name} last_name ${last_name} fullname ${fullname}`
        )
      }
    } else {
      ;[this.first_name, this.last_name] = fullname.split(' ')
    }
  }

  static fields = {
    first_name: TextField({ required: false }),
    last_name: TextField({ required: false }),
    fullname: TextField({ required: false }),
  }

  // TODO: how to specify the type and shape of the incoming obj
  static fromRecord(obj: any) {
    const first_name = obj.first_name as string
    const last_name = obj.last_name as string
    const fullname = obj.fullname as string
    return new Name(first_name, last_name, fullname)
  }
}

export const NameField = makeCompositeField(Name)

describe('compositeField ->', () => {
  test('constructed compositeField works', async () => {
    const TestSchema = new WorkbookTester(
      {
        buyer: NameField('buyer', { prefix: true }),
      },
      {}
    )
    await TestSchema.checkRowResult({
      rawData: {
        buyer_first_name: 'Paddy',
        buyer_last_name: 'Mullen',
        buyer_fullname: '',
        buyer: '',
      },
      expectedOutput: {
        buyer: {
          first_name: 'Paddy',
          last_name: 'Mullen',
          fullname: 'Paddy Mullen',
        },
      },
    })
    await TestSchema.checkRowResult({
      rawData: {
        buyer_first_name: '',
        buyer_last_name: '',
        buyer_fullname: 'Paddy Mullen',
        buyer: '',
      },
      expectedOutput: {
        buyer: {
          first_name: 'Paddy',
          last_name: 'Mullen',
          fullname: 'Paddy Mullen',
        },
      },
    })
  })
})
