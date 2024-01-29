import { interpret } from './interpret'

describe('Interpreter tests ->', () => {
  const intrTest = (expr: any, result: number | boolean | any[]) => {
    expect(interpret(expr)).toStrictEqual(result)
  }
  test('Basic arithmetic', () => {
    intrTest(['+', 1, 2], 3)
    intrTest(['+', 1, 2, 4], 7)
    intrTest(['-', 10, 2], 8)
    intrTest(['-', 10, 2, 3], 5)

    intrTest(['*', 1, 2], 2)
    intrTest(['*', 1, 2, 4], 8)
    intrTest(['/', 10, 2], 5)
    intrTest(['/', 18, 2, 3], 3)

    intrTest(['mod', 17, 5], 2)
  })

  test('Comparisons', () => {
    intrTest(['>', 1, 2], false)
    intrTest(['>', 3, 2], true)
    intrTest(['>', 3, 3], false)

    intrTest(['<', 1, 2], true)
    intrTest(['<', 3, 2], false)
    intrTest(['<', 3, 3], false)

    intrTest(['>=', 1, 2], false)
    intrTest(['>=', 3, 2], true)
    intrTest(['>=', 3, 3], true)

    intrTest(['<=', 1, 2], true)
    intrTest(['<=', 3, 2], false)
    intrTest(['<=', 3, 3], true)

    intrTest(['=', 1, 2], false)
    intrTest(['=', 2, 1], false)
    intrTest(['=', 1, 1], true)

    intrTest(['=', 'asdf', 'bbbb'], false)
    intrTest(['=', 'asdf', 'asdf'], true)

    intrTest(['=', true, false], false)
    intrTest(['=', true, true], true)

    intrTest(['=', [1, 2], [2, 1]], false)

    intrTest(['neq', 1, 2], true)
    intrTest(['neq', 2, 1], true)
    intrTest(['neq', 1, 1], false)

    intrTest(['neq', 'asdf', 'bbbb'], true)
    intrTest(['neq', 'asdf', 'asdf'], false)

    intrTest(['neq', true, false], true)
    intrTest(['neq', true, true], false)

    intrTest(['neq', [1, 2], [2, 1]], true)

    //I want better tests here, these don't really prove that `expr` isn't evaulated, just that it isn't returned
    intrTest(['when', true, 5], 5)
    intrTest(['when', false, 5], [])
    intrTest(['when', ['>', 6, 3], 5], 5)
    intrTest(['when', ['>', 3, 6], 5], [])

    // requires a value equal, not built yet
    //intrTest(['neq', [1,2], [1,2]], false)
  })

  test('other', () => {
    intrTest(['count', ['quote', [1, 2, 3]]], 3)
    intrTest(['count', 'foo'], 3)
  })
  test('Math', () => {
    intrTest(['abs', 2], 2)
    intrTest(['abs', -3], 3)
    intrTest(['abs', 0], 0)

    intrTest(['min', 4, 5], 4)
    // intrTest(['min', 10, 2, 4], 2)

    // intrTest(['max', 1, 2], 2)
    // intrTest(['max', 10, 2, 4], 10)
  })
})
