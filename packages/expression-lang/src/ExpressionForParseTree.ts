/*
expression language for validations so you can say
validate:Warn(Unless(Between(1,120), 'too old'))d
first pass of expression language will only have unless ,between, lessThan, greaterThan (edited) 
*/

export const Add = (...args: any) => ['+', ...args]
export const Subtract = (...args: any) => ['-', ...args]
export const Mult = (...args: any) => ['*', ...args]
export const Div = (...args: any) => ['/', ...args]
export const Mod = (a: any, b: any) => ['mod', a, b]

//Comparisons
export const GreaterThan = (a: any, b: any) => ['>', a, b]
export const GT = GreaterThan

export const LessThan = (a: any, b: any) => ['<', a, b]
export const LT = LessThan

export const GreaterThanEqual = (a: any, b: any) => ['>=', a, b]
export const GTE = GreaterThanEqual

export const LessThanEqual = (a: any, b: any) => ['<', a, b]
export const LTE = LessThanEqual

export const Equal = (a: any, b: any) => ['equal', a, b]

export const Between = (a: any, test: any, b: any) => [
  'and',
  ['<', a, test],
  ['<', test, b],
]

//Math
export const Abs = (a: any) => ['abs', a]
export const Min = (...args: any) => ['min', ...args]
export const Max = (...args: any) => ['max', ...args]
export const Round = (...args: any) => ['round', ...args]

//logic
export const Not = (a: any) => ['not', a]
export const And = (...args: any) => ['and', ...args]
export const Or = (...args: any) => ['or', ...args] // returns the first true element

export const Count = (...args: any) => ['count', ...args]
export const NotEqual = (a: any, b: any) => ['neq', a, b]
export const When = (predicate: any, expr: any) => ['when', predicate, expr]
export const Unless = (predicate: any, expr: any) => [
  'when',
  ['not', predicate],
  expr,
]
