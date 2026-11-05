# `IsSorted`

```cs
template IsSorted(n, b) {
  signal input in[n];
  signal output out;

  // range check
  for (var i = 0; i < n; i++) {
    _ <== Num2Bits(b)(in[i]);
  }

  // accumulator for in[i-1] <= in[i] checks
  var acc = 0;
  for (var i = 1; i < n; i++) {
    var isLessThan = LessEqThan(b)([in[i-1], in[i]]);
    acc += isLessThan;
  }

  // sorted only if all `n - 1` pairs are ordered
  out <== IsEqual()([acc, n - 1]);
}
```

If we need an array to be sorted, we could instead sort the array out-of-circuit and pass in the sorted array, finally asserting that it is sorted indeed. To do this, we can simply check that consecutive elements are ordered, that is $a_{i-1} \leq a_{i}$ for all $1 \leq i \lt n$. Since the correctness of `LessEqThan(b)` is guaranteed only for inputs of at most `b` bits, we also add a range check using `Num2Bits(b)`, which internally asserts that the input fits within `b` bits.

Each `LessEqThan` returns 1 for an ordered pair, so `acc` counts the ordered pairs. There are $n-1$ pairs, and the array is sorted only if **all** of them are ordered, so we return whether `acc` equals $n-1$.

> Be careful to not check whether `acc` is non-zero instead: that only tells that _some_ pair is ordered, and an array like `[0, 1, 2, 4, 3]` would be considered sorted!

# `AssertSorted`

```cs
template AssertSorted(n, b) {
  signal input in[n];

  // range check
  for (var i = 0; i < n; i++) {
    _ <== Num2Bits(b)(in[i]);
  }

  // accumulator for in[i-1] <= in[i] checks
  var acc = 0;
  for (var i = 1; i < n; i++) {
    var isLessThan = LessEqThan(b)([in[i-1], in[i]]);
    acc += isLessThan;
  }

  acc === n - 1;
}
```

If you would like to **assert** that the array is sorted instead of returning 0 or 1, you can simply constrain `acc === n-1` at the end, instead of comparing it with `IsEqual`.
