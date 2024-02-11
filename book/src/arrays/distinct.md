# Distinct

We may often require to check if an array has non-repeating values, also known as unique values or distinct values. A common example of this would be for a Sudoku circuit, e.g. you would like to assert that all values in a row are in range [1, 9] and that the row has distinct values.

## `AssertDistinct`

```cs
template AssertDistinct(n) {
  signal input in[n];

  for (var i = 0; i < n-1; i++){
    for (var j = i+1; j < n; j++){
      var eq = IsEqual()([in[i], in[j]]);
      eq === 0;
    }
  }
}
```

To assert that an array has distinct values, we can loop over the values and check each unique pair to be non-equal using the `IsEqual` template. For example, in an array of 4 elements this corresponds to the following checks:

```cs
IsEqual()([in[0], in[1]]) === 0
IsEqual()([in[0], in[2]]) === 0
IsEqual()([in[0], in[3]]) === 0
IsEqual()([in[1], in[2]]) === 0
IsEqual()([in[1], in[3]]) === 0
IsEqual()([in[2], in[3]]) === 0
```

## `IsDistinct`

```cs
template IsDistinct(n) {
  signal input in[n];
  signal output out;

  var acc = 0;
  for (var i = 0; i < n-1; i++){
    for (var j = i+1; j < n; j++){
      var eq = IsEqual()([in[i], in[j]]);
      acc += eq;
    }
  }

  signal outs <== acc;
  out <== IsZero()(outs);
}
```

If you would like to return a bit-signal based on whether an array has all distinct values or not, you can slightly modify the `AssertDistinct` template to obtain that functionality. Instead of asserting each `IsZero` check, we accumulate them and then return whether that final sum is equal to zero or not.

> Note that technically it is possible for `acc` to overflow and wrap back to 0, however, that is unlikely to happen given how large the prime-field is and we would need that many components to be able to overflow using 1+1+...+1 only.
