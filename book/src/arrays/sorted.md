# `IsSorted`

```cs
template IsSorted(n, b) {
  signal input in[n];
  signal output out;

  var acc = 0;
  for (var i = 1; i < n; i++) {
    var isLessThan = LessEqThan(b)([in[i-1], in[i]]);
    acc += isLessThan;
  }

  signal outs <== acc;
  var outsIsZero = IsZero()(outs);
  out <== 1 - outsIsZero;
}
```

If we need an array to be sorted, we could instead sort the array out-of-circuit and pass in the sorted array, finally asserting that it is sorted indeed. To do this, we can simply check that consecutive elements are ordered, that is $a_{i-1} < a_{i}$ for all $1 \leq i \lt n$.

> If you would like to **assert** that the array is sorted instead of returning 0 or 1, you can simply check that `outs === 0` at the end. We can be sure that `outs` can overflow with addition because the output of `LessEqThan` is a constrained bit.
