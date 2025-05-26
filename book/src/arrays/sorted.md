# `IsSorted`

```cs
template IsSorted(n, b) {
  signal input in[n];
  signal output out;

  // range check
  for (var i = 0; i < n; i++) {
    _ <== Num2Bits(b)(in[i]);
  }

  // accumulator for in[i-1] < in[1] checks
  var acc = 0;
  for (var i = 1; i < n; i++) {
    var isLessThan = LessEqThan(b)([in[i-1], in[i]]);
    acc += isLessThan;
  }

  // note that technically it is possible for `acc` to overflow
  // and wrap back to 0, however, that is unlikely to happen given
  // how large the prime-field is and we would need that many components
  // to be able to overflow
  signal outs <== acc;
  var outsIsZero = IsZero()(outs);
  out <== 1 - outsIsZero;
}
```

If we need an array to be sorted, we could instead sort the array out-of-circuit and pass in the sorted array, finally asserting that it is sorted indeed. To do this, we can simply check that consecutive elements are ordered, that is $a_{i-1} \leq a_{i}$ for all $1 \leq i \lt n$. Since the correctness of `LessEqThan(b)` is guaranteed only for inputs of at most `b` bits, we also add a range check using `Num2Bits(b)`, which internally asserts that the input fits within `b` bits

# `AssertSorted`

```cs
template AssertSorted(n, b) {
  signal input in[n];

  // range check
  for (var i = 0; i < n; i++) {
    _ <== Num2Bits(b)(in[i]);
  }

  // accumulator for in[i-1] < in[1] checks
  var acc = 0;
  for (var i = 1; i < n; i++) {
    var isLessThan = LessEqThan(b)([in[i-1], in[i]]);
    acc += isLessThan;
  }

  acc === n - 1;
}
```

If you would like to **assert** that the array is sorted instead of returning 0 or 1, you can simply check that `acc === n-1` at the end. This is because we make $n-1$ comparisons and accumulate all of them within `acc` variable. If all passes check, that should sum up to $n-1$.
