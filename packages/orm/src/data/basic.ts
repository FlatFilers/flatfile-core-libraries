import { ELevel, ERecordStatus, IRowResponse } from '../FlatfileRecord'

export const DATA_RECORD_BASIC: IRowResponse = {
  id: 9,
  valid: true,
  status: ERecordStatus.REVIEW,
  data: {
    full_name: 'John Doe',
    email: 'john@doe.com',
    zip_code: '2121',
  },
  info: [
    {
      level: ELevel.INFO,
      key: 'full_name',
      message: "That's a cool name, John",
    },
    {
      level: ELevel.WARN,
      key: 'email',
      message: 'That email looks kinda fake',
    },
    {
      level: ELevel.ERROR,
      key: 'zip_code',
      message: 'Not a real zip code',
    },
  ],
}
