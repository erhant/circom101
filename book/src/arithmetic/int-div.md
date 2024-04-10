# `IntDiv`

```cs
template IntDiv(n) {
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

  // contrain the division operation
  // in[0] / in[1] is defined as the unique pair (q, r) s.t.
  // in[0] = in[1] * q + r and 0 <= r < |in[1]|
  in[0] === quot * in[1] + rem;

  // OPTIONAL: quot edge case is when `rem = 0` and `in[1] = 1`
  // signal quot_is_valid <== LessEqThan(n)([quot, in[0]]);
  // 1 === quot_is_valid;

  signal rem_is_valid <== LessThan(n)([rem, in[1]]);
  1 === rem_is_valid;

  out <-- quot;
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

which would be wrong! On a side note, one may look at the case if we allowed $q > a$ such as the following:

$$
5 = 3 \times 2 - 1
$$

which is again wrong. Thankfully, the constraint on remainder prevents this as well; here we get $r = -1$ which corresponds to a very large number in the prime field, much larger than $b$ in most cases. If the integer division takes place over very large numbers, one may additionally check for $0 \leq q < a$.
