# Logic Gates

It is often required to do some logical operations like `AND`, `OR`, `NOT` and `XOR` within a circuit. For the circuits within this chapter, we can assume that the inputs are asserted to be bits, i.e. they are either 0 or 1.

## `AND`

```cs
{{#include ../../../circuits/bits/gates.circom:AND}}
```

The logic table of `AND` is as follows:

| $\land$ | 0   | 1   |
| ------- | --- | --- |
| 0       | 0   | 0   |
| 1       | 0   | 1   |

This can be achieved by simply multiplying the two inputs!

## `OR`

```cs
{{#include ../../../circuits/bits/gates.circom:OR}}
```

The logic table of `OR` is as follows:

| $\lor$ | 0   | 1   |
| ------ | --- | --- |
| 0      | 0   | 1   |
| 1      | 1   | 1   |

We _almost_ achieve the result by adding the two numbers, except that we get 2 when both are 1. Well, `AND` is only 1 when both numbers are 1, so we subtract it from the result to solve that issue.

What we have is equivalent to `in[0] + in[1] - AND(in)`.

## `XOR`

```cs
{{#include ../../../circuits/bits/gates.circom:XOR}}
```

The logic table of `XOR` is as follows:

| $\oplus$ | 0   | 1   |
| -------- | --- | --- |
| 0        | 0   | 1   |
| 1        | 1   | 0   |

We can use the same trick for `OR`, just once more, to make the `1 + 1` turn to a zero. What we have is equivalent to `in[0] + in[1] - 2 * AND(in)`.

## `NOT`

```cs
{{#include ../../../circuits/bits/gates.circom:NOT}}
```

A `NOT` gate maps 0 to 1, and 1 to 0. We can achieve this by simply subtracting the signal from 1. Since $1 - 0 = 1$ and $1 - 1 = 0$.

## `NAND`

```cs
{{#include ../../../circuits/bits/gates.circom:NAND}}
```

`NAND` is equivalent to `NOT(AND(in))`, giving us the circuit above.

## `NOR`

```cs
{{#include ../../../circuits/bits/gates.circom:NOR}}
```

`NOR` is equivalent to `NOT(OR(in))`, giving us the circuit above.

## Constraint Count

Each gate with two inputs multiplies them once, so `AND`, `OR`, `XOR`, `NAND` and `NOR` have 1 non-linear constraint each, while `NOT` is linear and has none.
