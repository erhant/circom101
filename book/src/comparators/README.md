# Comparators

Comparators compare two numbers in an arithmetic circuit. At the most basic level, we are interested in comparing a number to zero. Then, we can derive an equality check by simply checking if the difference of inputs is equal to zero.

- $a = 0$ is the `IsZero` circuit
- $a = b \implies a-b = 0$

We usually make use of `LessThan` circuit which does `a < b` check, and derive all other remaining comparisons from that. This should make sense, since assuming both `a` and `b` are integers we can say:

- $a < b$ is the `LessThan` circuit
- $a > b \implies b < a$
- $a \leq b \implies a < b+1$
- $a \geq b \implies b \leq a \implies b < a+1$

## `IsZero`

```cs
template IsZero() {
  signal input in;
  signal output out;

  signal inv <-- in != 0 ? 1 / in : 0;
  out <== 1 - (in * inv);

  in * out === 0;
}
```

Here, we check if the given number has a multiplicative inverse. The only number that does not have an inverse is 0. However, inverting a number is a non-quadratic constraint (hence the `<--` instead of `<==`) so must assume that `signal inv` can be any arbitrary value from the perspective of an adversarial prover. To constrain `inv`, we can invert it again! Notice that:

$$
i = 1/a \implies a \times i = 1
$$

We can't really add a constraint like `1 === in * inv` because it will simply fail when `in` is 0. That is why we make use of a ternary operator to simply set `inv` to be zero if `in` is zero. So, we may expect `in * inv` to equal 1 if indeed the number has an inverse, meaning that the number is non-zero. By subtracting this from 1, we essentially do a logical NOT operation on the result, so that if the `in` has an inverse `out` becomes 0.

Let's examine what happens when an adversary inputs some random `inv` on both cases where `in` is zero and non-zero:

When `in = 0` and `inv = x` all constraints are looking good:

- `out <== 1 - 0` constraint is fine
- `0 * out <== 0` constraint is fine

When `in != 0` and `inv = x` the constraint is indirectly implied:

- `out <== 1 - in * x`
- `in * (1 - in * x) <== 0`

Here, `out` could be anything but for `in * (1 - in * x) <== 0` to pass the only option is that `1 === in * x` so `x` must indeed be the inverse of `in`.

## `IsEqual`

```cs
template IsEqual() {
  signal input in[2];
  signal output out;

  out <== IsZero()(in[1] - in[0]);
}
```

As we mentioned before, if `a = b` then `a - b = 0`, allowing us to re-use the `IsZero` circuit.

## `LessThan`

```cs
template LessThan(n) {
  assert(n <= 252);
  signal input in[2];
  signal output out;

  component toBits = Num2Bits(n+1);
  toBits.in <== ((1 << n) + in[0]) - in[1];

  out <== 1 - toBits.out[n];
}
```

There is something going on here as you might notice, why are we using `Num2Bits` and what is that `1 << n` doing there? It will all make sense.

The trick of `LessThan` is to think of bitwise-subtraction. Think of subtracting two n-bit numbers, `a - b`. Now suppose that during this subtraction the n-bit is set to 1, which is what `1 << n` does. Note that the most significant bit of an n-bit number is (n-1)'th bit, as we are speaking in zero-indexed terms.

If `a` is less than `b`, then during this subtraction `a` will have to borrow that n'th bit. Otherwise, it is large enough that `b` can be subtracted without needing to borrow. To see if `a < b` we can simply check if n'th bit is borrowed or not during a subtraction. Since n'th bit will be 0 if it is borrwed, we must do a logical NOT operation (simply subtract the result from 1) as we assign it to the output.

The role of `assert(n <= 252)` is to ensure we can safely set n'th bit to 1. That would be a problem if `n` were to be greater than 252, as that is where the order of scalar field of our curve (BN254 in this case) is cut-off.

## `LessEqThan`

```cs
template LessEqThan(n) {
  signal input in[2];
  signal output out;

  out <== LessThan(n)([in[0], in[1]+1]);
}
```

This is because $a \leq b \implies a < b+1$.

## `GreaterThan`

```cs
template GreaterThan(n) {
  signal input in[2];
  signal output out;

  out <== LessThan(n)([in[1], in[0]]);
}
```

This is because $a > b \implies b < a$.

## `GreaterEqThan`

```cs
template GreaterEqThan(n) {
  signal input in[2];
  signal output out;

  out <== LessThan(n)([in[1], in[0]+1]);
}
```

This is because $a \geq b \implies b \leq a \implies b < a+1$.
