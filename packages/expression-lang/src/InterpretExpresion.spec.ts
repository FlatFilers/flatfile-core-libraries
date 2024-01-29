import { interpret } from './interpret'

describe('Interpreter tests ->', () => {
  test('Quote', () => {
    expect(interpret(['quote', [1, 2, 3]])).toMatchObject([1, 2, 3])
    expect(interpret(['quote', ['variable', 2, 3]])).toMatchObject([
      'variable',
      2,
      3,
    ])
  })
  test('variables ', () => {
    expect(interpret(['variable', 'foo'], { foo: 8 })).toBe(8)

    //variable in the middle of a list
    expect(interpret([['variable', 'foo'], 8], { foo: 7 })).toMatchObject([
      7, 8,
    ])
    expect(interpret([5, ['variable', 'foo'], 8], { foo: 6 })).toMatchObject([
      5, 6, 8,
    ])
  })
  test('Interpret', () => {
    expect(interpret(['count', ['quote', [1, 2, 3]]])).toBe(3)
  })
  test('can include string quote as a literal', () => {
    expect(interpret(['quote', ['quote', 2, 3]])).toMatchObject(['quote', 2, 3])
  })

  test('can include other function names as literals', () => {
    expect(interpret(['quote', ['count', 2, 3]])).toMatchObject(['count', 2, 3])
  })
  test('can include a single value as a literal', () => {
    expect(interpret(['quote', 2])).toBe(2)
    expect(interpret(['quote', 'quote'])).toBe('quote')
    expect(interpret('asdf')).toBe('asdf')
    expect(interpret('quote')).toBe('quote')
  })
  test('Interpreter errors', () => {
    expect(() => interpret(['non-existent-func', 1, 2])).toThrow(
      'Error, couldn\'t find function or variable non-existent-func from ["non-existent-func",1,2]'
    )
    expect(() => interpret(['variable', 'asdf'])).toThrow(
      'Referenced non-existent variable asdf'
    )
  })
})

describe('applied interpreter tests ->', () => {
  test('CountExpr', () => {
    expect(
      interpret(['count', ['variable', 'group']], { group: [1, 2, 3] })
    ).toBe(3)
  })
})
