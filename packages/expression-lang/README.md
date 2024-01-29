# @flatfile/expression-lang

This package defines a set of functions that represent an expression language for validations. These functions allow you to create complex validation rules by combining simpler expressions.

## Functions:

### Mathematical Operations:

- Add, Subtract, Mult, Div, Mod: Perform addition, subtraction, multiplication, division, and modulo operations respectively.

### Comparisons:

- GreaterThan, GT: Check if the first argument is greater than the second.
- LessThan, LT: Check if the first argument is less than the second.
- GreaterThanEqual, GTE: Check if the first argument is greater than or equal to the second.
- LessThanEqual, LTE: Check if the first argument is less than or equal to the second.
- Equal: Check if the two arguments are equal.
- NotEqual: Check if the two arguments are not equal.
- Between: Check if a test value is between two values.

### Mathematical Functions:

- Abs: Calculate the absolute value of a number.
- Min: Find the minimum value among the provided arguments.
- Max: Find the maximum value among the provided arguments.
- Round: Round a number to the nearest integer.

### Logical Functions:

- Not: Negate a boolean value.
- And: Check if all the provided arguments evaluate to true.
- Or: Check if at least one of the provided arguments evaluates to true.
- Count: Count the number of elements in the provided arguments.
- When: Evaluate an expression if a predicate is true.
- Unless: Evaluate an expression unless a predicate is true.

These functions are used to construct expressions in the defined expression language for validations.

## makeInterpreter

`makeInterpreter` creates an interpreter for a custom instruction-based language. The interpreter takes instructions in the form of nested arrays and evaluates them based on a set of predefined functions (baseFns) and additional functions (extraFns) passed as an argument to makeInterpreter.

The interpreter processes the instructions recursively, evaluates function calls, handles variables, and returns the result of the interpreted instructions. The interpret function is a convenience function that creates an interpreter with an empty set of extra functions.
