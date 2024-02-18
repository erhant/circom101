# Arrays

Circom arrays are a different kind of beast. The main reason is that in Circom, array operations must be **known** at compile-time. What do we mean by this:

- Array sizes are fixed, e.g. you can't define an array based on the user input after compiling the circuit.
- Array indexing should be known at compile time, e.g. you can't ask a user for index `i` and return `arr[i]` like you _normally_ do.

Before we get to the problematic unknown-at-compile-time stuff, let's quickly recap the known-at-compile-time array operations:

```cs
// an array with N elements
signal arr[N];

// a multi-dimensional array of size N * M
signal arr[N][M];

// read element at index i for known i
foo <== arr[i];

// write to element at index j for known j
arr[j] <== bar;
```

So now, what if we want to read or write to an index unknown at compile time?

## `ArrayRead`

```cs
template ArrayRead(n) {
  signal input in[n];
  signal input index;
  signal output out;

  signal intermediate[n];
  for (var i = 0; i < n; i++) {
    var isIndex = IsEqual()([index, i]);
    intermediate[i] <== isIndex * in[i];
  }

  out <== Sum(n)(intermediate);
}
```

To read an unknown index, we could instead read ALL signals (which is an operation known-at-compile-time) and then return a linear combination of them, with each value multiplied with an equality-check with our index.

```py
arr_i =
  A[0]   * (i == 0)
+ A[1]   * (i == 1)
+ ...
+ A[n-1] * (i == n-1)
```

This way, our array accesses are known at compile-time but we are still able to get the value at index `i`.

```py
arr_i =
  A[0]   * 0
+ A[1]   * 0
+ ...
+ A[i]   * 1
+ ...
+ A[n-1] * 0
= A[i]
```

Note that this will incur some contraint costs.

> The `Sum(n)` here is rather straight-forward:
>
> ```cs
> template Sum(n) {
>   signal input in[n];
>   signal output out;
>
>   var lc = 0;
>   for (var i = 0; i < n; i++) {
>     lc += in[i];
>   }
>   out <== lc;
> }
> ```
>
> `lc` here means "linear combination" and its just a variable that stores:
>
> ```py
> lc = in[0] + in[1] + ... + in[n-1]
> ```

## `ArrayWrite`

```cs
template ArrayWrite(n) {
  signal input in[n];
  signal input index;
  signal input value;
  signal output out[n];

  for (var i = 0; i < n; i++) {
    var isIndex = IsEqual()([index, i]);
    out[i] <== IfElse()(isIndex, value, in[i]);
  }
}
```

Writing to an unknown-index works in a similar way to reading one. The idea is to simply copy the input signal array to an output array, but only at the index `i` we will use our new value instead of the existing one at `in[i]`.

We had defined the `IfElse` template at [control-flow](../control-flow/) section.
