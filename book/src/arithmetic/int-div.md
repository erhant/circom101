# `IntDiv`

```cs
template IntDiv(n) {
  // ensures that `quot * in[1] + rem` can not wrap around the field
  assert(n <= 125);
  signal input in[2];
  signal output out;

  // divisor must be non-zero
  signal is_non_zero <== IsZero()(in[1]);
  0 === is_non_zero;

  // compute the quotient and remainder outside the circuit
  var quot_hint = in[0] \ in[1];
  var rem_hint = in[0] % in[1];
  signal quot <-- quot_hint;
  signal rem <-- rem_hint;

  // quotient & remainder must be n-bit numbers, otherwise a dishonest prover can
  // pick a "negative" remainder (a large field element) that still passes the
  // `rem < in[1]` check, or a quotient that is a field division `in[0] / in[1]`
  _ <== Num2Bits(n)(quot);
  _ <== Num2Bits(n)(rem);

  // constrain the division operation
  // in[0] / in[1] is defined as the unique pair (q, r) s.t.
  // in[0] = in[1] * q + r and 0 <= r < |in[1]|
  in[0] === quot * in[1] + rem;

  component remIsLess = LessThan(n);
  remIsLess.in <== [rem, in[1]];
  remIsLess.out === 1;

  out <== quot;
}
```

Doing integer division within a circuit is more costly than what one might one expect! Consider two $n$-bit numbers $a$ and $b$. An integer division implies the following equation:

$$
a = q \times b + r
$$

where $q$ is the quotient, and $r$ is the remainder such that $0 \leq r < b$. As an example, consider the division $5/2$. We have:

$$
5 = 2 \times 2 + 1
$$

giving us the quotient $q = 2$ and remainder $r = 1$. Notice that if we allowed $r \geq b$, we could have:

$$
5 = 1 \times 2 + 3
$$

which would be wrong! This is why we constrain the remainder with `LessThan`, to ensure $r < b$.

However, that check alone is not enough. Remember that we are working in a prime field, where a "negative" number such as $-1$ is actually a very large number $p - 1$. Consider the following:

$$
10 = 4 \times 3 + (-2)
$$

This is a quotient $q = 4$ with a remainder $r = -2$, which is wrong since $10 / 3$ should give $q = 3$. Is $-2 < 3$? It should not be in the field, as $-2$ is a very large number there; however, `LessThan(n)` is only correct for $n$-bit inputs! It computes $2^n + r - b = 2^n - 5$, which is an $(n+1)$-bit number with its $n$'th bit unset, so it says that $r < b$. A dishonest prover could then claim that $10 / 3 = 4$.

To prevent this, we range-check both the quotient and the remainder using `Num2Bits(n)`:

- With $0 \leq r < 2^n$, the remainder can not be "negative" anymore, and `LessThan(n)` can safely check $r < b$.
- With $0 \leq q < 2^n$, the quotient can not be a field element like $(a - r) \cdot b^{-1}$, which would satisfy $a = q \times b + r$ in the field for _any_ $r$.

Finally, we must make sure that $q \times b + r$ can not wrap around the field, otherwise the equation $a = q \times b + r$ would only hold "modulo $p$" instead of over the integers. As $q$ and $r$ are $n$-bit numbers, and $b$ can be at most $n+1$ bits (otherwise `LessThan` fails), the result is less than $2^{2n+2}$. The `assert(n <= 125)` ensures that this is less than the prime of BN254, which is around $2^{253}$.

> With these checks, the circuit has a unique solution for given $a$ and $b$: the quotient $q$ and remainder $r$ of the usual integer division.
