# Bits

A bit value can only be 0 or 1. As such, they can be treated as **booleans** too, where 0 is `false` and 1 is `true`. It is often useful to convert a number to it's binary representation, or simply assert that a number can fit into `n`-bits for some `n` that is known at compile time.

## `AssertBit`

```cs
{{#include ../../../circuits/bits/index.circom:AssertBit}}
```

To assert that a given number $n$ is bit (i.e. 0 or 1) you only have to check that $n^2 = n$, as there are only two numbers whose square equals to itself: 0 and 1. This expression is equivalent to $n \times (n - 1) = 0$, which is how we've written in the circuit above.

Normally people assert that a signal is bit without the template above; instead, it is preferred to do this inline where it is needed. Well, nothing really stops you from using templates.

## `Num2Bits`

```cs
{{#include ../../../circuits/bits/index.circom:Num2Bits}}
```

`Num2Bits` is an often used circuit that decomposes a given number to `n` bits. In doing so, it will assert that the number is representable by that many bits too. The binary decomposition happens the way it is done in most languages: shift and get the last bit, within a loop.

The operation `(in >> i) & 1` is non-quadratic, so we have to use `<--` there to assign the result to `out[i]` signal. At this point, `out[i]` can be anything given by a malicious prover, we have to constrain it. At the very least, we can assert `out[i]` to be a bit.

The important constraint in this template is that `out` when converted back to decimal should equal our number `in`. We make that constraint using the `lc` variable, which really acts like a `sum` in programming. It is important to remember at this point that Circom is an HDL, instead of a programming language. So, if we were to treat `lc` like some variable that is storing the sum, it won't really be the reality. Here instead `lc` is a linear-combination of the signals:

```cs
lc = out[0]*1 + out[1]*2 + out[2]*4 + ... + out[n-1]*2^(n-2)
```

Thankfully, this entire equality is a quadratic constraint and we can simply check if `lc === in` to ensure the bitwise representation is correct.

> **Exercise**: How would you modify `Num2Bits` above to obtain a template like `AssertBits(n)` that ensures a number can be represented by `n` bits?

## `Bits2Num`

```cs
{{#include ../../../circuits/bits/index.circom:Bits2Num}}
```

If we can convert from an `n`-bit number to its binary representation, surely we should be able to convert from the binary representation with `n`-bits to the number itself. We do that with `Bits2Num`. This operation is rather straightforward, we just need to compute:

$$
n = \sum_{i = 0}^{n-1}\texttt{in}_i2^i
$$

We use `bit_value` to keep track of $2^i$, and this entire sum expression is stored within the `lc` (linear combination). In the end, we constrain the output signal to be equal to this expression.

> Note that for both `Num2Bits` and `Bits2Num`, the most-significant bit is the last element of the array, and least-significant bit is the first element of the array. To demonstrate, consider the 4-bit number 11, normally shown as $(1011)_2$ in maths. However, in these circuits we store the array `[1, 1, 0, 1]`, in the opposite order!

## Function: `nbits`

```cs
{{#include ../../../circuits/bits/index.circom:nbits}}
```

We might want to find the minimum number of bits required to represent a **known** value; we use a function called `nbits` (as in Circomlib) for that. Here, our parameter `n` is known at compile time, perhaps a generic argument or some constant somewhere.

The idea of this function is to shift the number to the right one bit at a time, counting how many shifts it takes until nothing is left. For example, $9 = (1001)_2$ becomes $(100)_2$, $(10)_2$, $(1)_2$ and finally $0$, so `nbits(9) = 4`.

> You may think of a loop such as `while (2**ans - 1 < n)` instead, but beware: Circom compares field elements as **signed** numbers, where values larger than $p/2$ are negative. For example, `-1 < 0` is true, even though `-1` is actually $p - 1$ in the field. Shifts on the other hand work with the actual value, so with shifts `nbits(-1)` correctly returns the number of bits of the largest field element, which is 254 for BN254.

## Constraint Count

| Circuit       | Constraints |
| ------------- | ----------- |
| `AssertBit`   | 1           |
| `Num2Bits(n)` | $n$         |
| `Bits2Num(n)` | $n$         |

Every bit costs one constraint, to assert that it is a bit; the sum of the bits is a linear combination, which is free. The function `nbits` is computed at compile time, so it has no constraints at all.
