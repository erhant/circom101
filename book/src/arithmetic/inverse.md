# `Inverse`

```cs
template Inverse() {
  signal input in;
  signal output out;

  assert(in != 0);

  signal inv <-- in != 0 ? 1 / in : 0;
  signal isZero <== 1 - (in * inv);

  // if isZero, since in = 0 this holds
  // otherwise, it holds due to in * 0 == 0
  in * isZero === 0;
  inv * isZero === 0;

  out <== inv;
}
```

The (multiplicative) inverse of an element $n$ within a prime field is denoted as $n^{-1}$ such that $n \times n^{-1} = 1$. An additive inverse of $n$ is shown as $-n$ and it holds that $n + (-n) = 0$. Inverting an element within the circuit is inefficient, so the inverse is computed off-circuit and a constraint is added to make sure their multiplications result in 1.

Zero does not have a multiplicative inverse though, and we can have a run-time assertion `assert(in != 0)` as shown above to prevent that. However, a run-time assertion does not prevent a malicious prover to provide an altered witness that has a zero value for `in`. We must handle that case as well, to output a certain value fo `inv` when the input is zero. In the circuit above, we set `inv` to be zero as well, and the constraint `inv * isZero === 0` holds when the input is non-zero but `inv` is zero.

> There are two ways to find an inverse outside the circuit:
>
> 1. Use Extended Euclidean Algorithm
> 2. Use Fermat's Little Theorem
>
> Interested reader can check them out on the web!
