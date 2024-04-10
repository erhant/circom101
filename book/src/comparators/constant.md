# Constant Comparisons

Circomlib comes with a more efficient method when we are comparing one signal with another constant. In this section, we will explain the constant-comparison method along with several of its usages.

These methods depend on the prime field used within the circuit, and therefore re-using these same circuits may cause bugs due to hard-coded values in other prime fields!

## `CompConstant`

TODO: the circuit code is written but I cant yet explain how it works...

## `AliasCheck`

```cs
template AliasCheck() {
  signal input in[254];

  component comparator = CompConstant(-1);
  for (var i=0; i<254; i++) {
    comparator.in[i] <== in[i];
  }
  comparator.out === 0;
}
```

Alias check simply asserts that a given 254-bit number is within the prime field of BN254. The role of -1 there is just a short-cut to obtain the largest number within the field.

## `Sign`

```cs
template Sign() {
  signal input in[254];
  signal output sign;

  var half = 1 / 2;
  component comparator = CompConstant(half - 1);
  for (var i = 0; i < 254; i++) {
      comparator.in[i] <== in[i];
  }

  sign <== comparator.out;
}
```

In a prime field, a field element is defined to be positive if it is closer to 0 than it is to the order of the field. `Sign` checks for that property and returns 0 if the number is positive, otherwise 1 if the number is negative. Specifically, for order $p$ and a number $n < p$ the sign of $n$ is:

- positive when $n \geq p/2$
- negative when $n < p/2$
