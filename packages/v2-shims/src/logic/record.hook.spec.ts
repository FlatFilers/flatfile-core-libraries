import { applyResults, convertHook, recordToDictionary } from './record.hook'
import type { FlatfileRecord } from '@flatfile/hooks'

describe('record.hook.ts', () => {
  describe('convertHook', () => {
    const mockRecord: any = {
      value: { someKey: { value: 'someValue' } },
      set: jest.fn(),
      addError: jest.fn(),
      addWarning: jest.fn(),
      addInfo: jest.fn(),
    }

    it('should correctly convert V2RecordHook to ModernHook', async () => {
      const mockV2Hook: any = jest.fn().mockResolvedValue({
        someKey: {
          value: 'newValue',
          info: [{ level: 'error', message: 'An error occurred' }],
        },
      })

      const convertedHook = convertHook(mockV2Hook)

      await convertedHook(mockRecord)

      // Check if V2 hook was called with correct parameters
      expect(mockV2Hook).toHaveBeenCalledWith(
        recordToDictionary(mockRecord),
        0,
        'update'
      )

      // Check if record.set was called with correct parameters (from applyResults)
      expect(mockRecord.set).toHaveBeenCalledWith('someKey', 'newValue')

      // Check if record.addError was called (from applyResults)
      expect(mockRecord.addError).toHaveBeenCalledWith(
        'someKey',
        'An error occurred'
      )
    })
  })

  describe('recordToDictionary', () => {
    it('should convert a Flatfile record with scalar values to a scalar dictionary', () => {
      const record: any = {
        value: {
          name: 'John',
          age: 30,
        },
      }

      const result = recordToDictionary(record)
      expect(result).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('should handle objects with "value" properties correctly', () => {
      const record: any = {
        value: {
          name: { value: 'John' },
          age: 30,
        },
      }

      const result = recordToDictionary(record)
      expect(result).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('should handle a mix of objects with "value" properties and scalar values', () => {
      const record: any = {
        value: {
          name: { value: 'John' },
          age: 30,
          address: { value: 'Street 123' },
          email: 'john@example.com',
        },
      }

      const result = recordToDictionary(record)
      expect(result).toEqual({
        name: 'John',
        age: 30,
        address: 'Street 123',
        email: 'john@example.com',
      })
    })
  })

  describe('applyResults', () => {
    // Mock the FlatfileRecord
    const createMockRecord = (initialValue: any = {}): FlatfileRecord =>
      ({
        value: initialValue,
        set: jest.fn(),
        addError: jest.fn(),
        addWarning: jest.fn(),
        addInfo: jest.fn(),
      } as any)

    it('should set the values appropriately', () => {
      const mockRecord = createMockRecord({ name: 'John', age: 30 })
      const hookResults = {
        name: 'Jane',
        age: 25,
      }

      applyResults(hookResults, mockRecord)

      expect(mockRecord.set).toHaveBeenCalledWith('name', 'Jane')
      expect(mockRecord.set).toHaveBeenCalledWith('age', 25)
    })

    it('should handle error level correctly', () => {
      const mockRecord = createMockRecord()
      const hookResults: any = {
        name: {
          value: 'Jane',
          info: [{ level: 'error', message: 'Invalid name format' }],
        },
      }

      applyResults(hookResults, mockRecord)

      expect(mockRecord.addError).toHaveBeenCalledWith(
        'name',
        'Invalid name format'
      )
    })

    it('should handle warning level correctly', () => {
      const mockRecord = createMockRecord()
      const hookResults: any = {
        age: {
          value: 17,
          info: [{ level: 'warning', message: 'Age seems low' }],
        },
      }

      applyResults(hookResults, mockRecord)

      expect(mockRecord.addWarning).toHaveBeenCalledWith('age', 'Age seems low')
    })

    it('should handle info level correctly', () => {
      const mockRecord = createMockRecord()
      const hookResults: any = {
        email: {
          value: 'jane@example.com',
          info: [{ level: 'info', message: 'Email format is valid' }],
        },
      }

      applyResults(hookResults, mockRecord)

      expect(mockRecord.addInfo).toHaveBeenCalledWith(
        'email',
        'Email format is valid'
      )
    })
  })
})
