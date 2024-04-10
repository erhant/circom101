# `AliasCheck`

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

> Note that Circom allows multiple prime fields, and re-using this same circuit may cause bugs due to hard-coded values!
