# Range Checks

A range-check is a common utility, asserting that a number is in some range `[MIN, MAX]`. It is important to keep in mind that you can make use of bit-decompositions to check for range `[0, 2^n)`, which would be done by simply checking if a number is representable with `n`-bits.

> Other zkDSLs often use lookup tables for range checks, which can be much cheaper than bit decompositions. Circom compiles to R1CS, which has no lookup tables, so we use bit decompositions instead.

## `AssertInRange`

```cs
{{#include ../../../circuits/comparators/range.circom:AssertInRange}}
```

Above is one way of doing a generic range check. Our approach here is to check:

- `in - MIN` is a b-bit value
- `in + 2^b - 1 - MAX` is a b-bit value

where `b` is the minimum number of bits required to represent `MAX`. The `nbits` function is described within the [bits section](../bits/).

If `in < MIN`, the operation `in - MIN` will underflow and we will have a huge number, definitely not be b-bit representable (assuming a not-so-large MAX). As an edge case, if `in == MIN` we get 0, which is definitely b-bits.

If `in > MAX`, the operation `in + 2^b - 1 - MAX` becomes larger than `2^b - 1`, which is not b-bit representable. As an edge case, if `in == MAX` we get `2^b - 1`, which is the largest b-bit number.

## Constraint Count

`AssertInRange(MIN, MAX)` decomposes two numbers into $b$ bits, where $b$ is the number of bits of `MAX`, so it has $2b$ non-linear constraints. For example, `AssertInRange(1, 9)` has 8, and `AssertInRange(0, 1000)` has 20.
