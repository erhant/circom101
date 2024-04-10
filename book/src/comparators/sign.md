# `Sign`

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

> Note that Circom allows multiple prime fields, and re-using this same circuit may cause bugs due to hard-coded values!
