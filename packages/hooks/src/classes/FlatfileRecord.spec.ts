import { mock, restore, Stub } from 'simple-mock'

import { FlatfileRecord, IRawRecord } from './FlatfileRecord'

describe('FlatfileRecord', () => {
  let person: FlatfileRecord
  let log: Stub<boolean>
  let rawRecord: IRawRecord

  beforeEach(() => {
    rawRecord = {
      rawData: { name: 'Jared', age: 12, favePet: null },
      metadata: { title: 'I am some metadata' },
      rowId: 1,
    }
    person = new FlatfileRecord(rawRecord)
    log = mock(console, 'error', () => true)
  })

  it('returns a rowId for a given record', () => {
    expect(person.rowId).toEqual(rawRecord.rowId)
  })

  it('returns a value for a field that exists', () => {
    expect(person.get('age')).toEqual(rawRecord.rawData.age)
  })

  it('returns null value for a field that does not exist', () => {
    expect(person.get('job')).toBeNull()
  })

  it('returns an updated record if a records value is changed but retain its original value', () => {
    const growUp = (rawRecord.rawData.age as number) + 1

    person.set('age', growUp)

    expect(person.value.age).toEqual(growUp)
    expect(person.originalValue.age).toEqual(rawRecord.rawData.age)
  })

  it('adds messages with varying levels of severity to fields', () => {
    person.addInfo('name', 'Rad name')
    person.addComment('age', 'What a name')
    person.addError('age', 'So immature')
    person.addWarning(['name', 'age'], 'Name too rad, age too immature')

    const res = person.toJSON()
    const info = res.info.find((message) => message.level === 'info')
    const comment = res.info.find(
      (message) => message.level === 'info' && message.field === 'age'
    )
    const error = res.info.find((message) => message.level === 'error')
    const nameWarning = res.info.find(
      (message) => message.level === 'warn' && message.field === 'name'
    )
    const ageWarning = res.info.find(
      (message) => message.level === 'warn' && message.field === 'age'
    )

    expect(info).toEqual({
      field: 'name',
      message: 'Rad name',
      level: 'info',
      stage: 'other',
    })

    expect(comment).toEqual({
      field: 'age',
      message: 'What a name',
      level: 'info',
      stage: 'other',
    })

    expect(error).toEqual({
      field: 'age',
      message: 'So immature',
      level: 'error',
      stage: 'other',
    })

    expect(nameWarning).toEqual({
      field: 'name',
      message: 'Name too rad, age too immature',
      level: 'warn',
      stage: 'other',
    })

    expect(ageWarning).toEqual({
      field: 'age',
      message: 'Name too rad, age too immature',
      level: 'warn',
      stage: 'other',
    })
  })

  it('does not return an updated record if a record value that does not exist is changed', () => {
    person.set('job', 'engineer')

    expect(person.value.job).toBeUndefined()
  })

  it('setter logs an error when no property', () => {
    person.set('job', 'engineer')
    expect(log.callCount).toBe(1)
  })

  it('sets readonly status on a given field', () => {
    person.setReadOnly('age')
    // @ts-ignore
    expect(person._config.fields.age.readonly).toBe(true)
  })

  it('sets readonly status on all fields', () => {
    person.setReadOnly()
    // @ts-ignore
    expect(person._config.readonly).toBe(true)
  })

  it('sets writable status on a given field', () => {
    person.setWritable('age')
    // @ts-ignore
    expect(person._config.fields.age.readonly).toBe(false)
  })

  it('sets writable status on all fields', () => {
    person.setWritable()
    // @ts-ignore
    expect(person._config.readonly).toBe(false)
  })

  it('gets the record as an object', () => {
    expect(person.obj).toEqual({ name: 'Jared', age: 12, favePet: null })
  })

  it('should get and set linked values', () => {
    const record = new FlatfileRecord(rawRecord)

    expect(
      record.setLinkedValue('favePet', 'name', 'rover').value
    ).toHaveProperty('favePet::name')
    expect(record.getLinkedValue('favePet', 'name')).toBe('rover')
  })

  it('returns the metadata for a record', () => {
    expect(person.getMetadata()).toEqual({ title: 'I am some metadata' })
  })

  it('updates the metadata for a record', () => {
    person.setMetadata({ title: 'I am some different metadata' })
    expect(person.getMetadata()).toEqual({
      title: 'I am some different metadata',
    })
  })

  it('computes a field based on the value of the field', () => {
    person.compute('age', (age) => Number(age) + 1, 'age was increased by one')
    expect(person.get('age')).toBe(13)
    const messages = person.toJSON().info
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatchObject({
      field: 'age',
      level: 'info',
      message: 'age was increased by one',
    })
  })

  it('computes a field based on the value of multiple fields', () => {
    person.compute(
      'name',
      (name, record) => `${name} ${record.get('age')}`,
      'age was appended to name'
    )
    expect(person.get('name')).toBe('Jared 12')
    const messages = person.toJSON().info
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatchObject({
      field: 'name',
      level: 'info',
      message: 'age was appended to name',
    })
  })

  it('adds an error message if a validate condition is not met', () => {
    person.validate(
      'age',
      (age) => {
        return Number(age) > 13
      },
      'must be older than 13'
    )
    const messages = person.toJSON().info
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatchObject({
      field: 'age',
      level: 'error',
      message: 'must be older than 13',
    })
  })

  it('does not add an error message if a validate condition is met', () => {
    person.validate(
      'age',
      (age) => {
        return Number(age) > 11
      },
      'must be older than 11'
    )
    const messages = person.toJSON().info
    expect(messages.length).toBe(0)
  })

  it('validates based on the value of mulitple fields', () => {
    person.validate(
      'age',
      (age, record) => {
        if (record.get('name') === 'Jared') {
          return Number(age) > 13
        } else {
          return Number(age) > 11
        }
      },
      'Jared must be older than 13'
    )
    const messages = person.toJSON().info
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatchObject({
      field: 'age',
      level: 'error',
      message: 'Jared must be older than 13',
    })
  })

  afterEach(() => {
    restore()
  })
})
