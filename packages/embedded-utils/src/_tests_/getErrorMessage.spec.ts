import { getErrorMessage } from '../utils/getErrorMessage'

describe('getErrorMessage', () => {
  it('should return the error message when given an instance of Error', () => {
    const error = new Error('Something went wrong')
    const errorMessage = getErrorMessage(error)
    expect(errorMessage).toBe('Something went wrong')
  })

  it('should return the string representation of the error when given any other value', () => {
    const error = 404
    const errorMessage = getErrorMessage(error)
    expect(errorMessage).toBe('404')
  })
})
