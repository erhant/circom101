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

  // quot edge case is when `rem = 0` and `in[1] = 1`
  signal quot_is_valid <== LessEqThan(n)([quot, in[0]+1]);
  1 === quot_is_valid;

  signal rem_is_valid <== LessThan(n)([rem, in[1]]);
  1 === rem_is_valid;

  out <-- quot;
}
```

Doing integer division within a circuit is more costly than what one might one expect, it actually comes with a range check!

TODO
