import { NotEqual, GT } from './ExpressionForParseTree'

describe('Verify translation of ExpressionLange to parse tree ->', () => {
  test('expand parse tree', () => {
    expect(NotEqual(GT(5, 3), 3)).toMatchObject(['neq', ['>', 5, 3], 3])
  })
})
