# `Inverse`

```cs
template Inverse() {
  signal input in;
  signal output out;

  assert(in != 0);

  signal inv <-- in != 0 ? 1 / in : 0;
  signal isZero <== 1 - (in * inv);

  // if isZero, since in = 0 this holds
  // otherwise, it holds due to in * 0 == 0
  in * isZero === 0;
  inv * isZero === 0;

  out <== inv;
}
```

TODO: describe
