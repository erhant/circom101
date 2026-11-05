# Inversion

The (multiplicative) inverse of an element $n$ within a prime field is denoted as $n^{-1}$ such that $n \times n^{-1} = 1$. An additive inverse of $n$ is shown as $-n$ and it holds that $n + (-n) = 0$. Inverting an element within the circuit is inefficient, so the inverse is computed off-circuit and a constraint is added to make sure their multiplications result in 1.

## `Inverse`

```cs
{{#include ../../../circuits/arithmetic/inverse.circom:Inverse}}
```

Zero does not have a multiplicative inverse though. The `assert(in != 0)` above only runs while computing the witness, and it does not add any constraint, so a malicious prover could still provide a witness with `in = 0`. So the circuit handles that case with constraints as well, very much like [`IsZero`](../comparators/#iszero):

- If `in` is not zero, `in * isZero === 0` forces `isZero = 0`, which means `in * inv = 1`, i.e. `inv` is the inverse of `in`.
- If `in` is zero, then `isZero = 1`, and `inv * isZero === 0` forces `inv = 0`.

So the circuit returns 0 for an input of 0, and it is up to the caller to make sure that this is acceptable, or that the input is non-zero.

> There are two ways to find an inverse outside the circuit:
>
> 1. Use Extended Euclidean Algorithm
> 2. Use Fermat's Little Theorem
>
> Interested reader can check them out on the web!

## Constraint Count

`Inverse` has 3 non-linear constraints: one for `isZero`, and one for each of the two checks.
