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
{{#include ../../../circuits/arrays/index.circom:ArrayRead}}
```

To read an unknown index, we could instead read ALL signals (which is an operation known-at-compile-time) and then return a linear combination of them, with each value multiplied with an equality-check with our index.

```py
arr_i =
  A[0]   * (i == 0)
+ A[1]   * (i == 1)
+ ...
+ A[n-1] * (i == n-1)
```

This way, our array accesses are known at compile-time but we are still able to get the value at index `i`, albeit at the cost of some constraints.

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

In the paper [xJsnark](https://akosba.github.io/papers/xjsnark.pdf), this method is referred to as "Linear Scan".

> If `index` is not within $[0, n)$, all of the equality checks are 0, and `ArrayRead` simply returns 0 instead of failing. If the index comes from the prover, you should range-check it yourself; see [Two Sum](../examples/intermediate/two-sum.md) for an example where forgetting this breaks the circuit.

## `ArrayWrite`

```cs
{{#include ../../../circuits/arrays/index.circom:ArrayWrite}}
```

Writing to an unknown-index works in a similar way to reading one. The idea is to simply copy the input signal array to an output array, but only at the index `i` we will use our new value instead of the existing one at `in[i]`.

> We have defined the `IfElse` template under the [Control Flow](../control-flow/) section.

## Constraint Count

Both `ArrayRead(n)` and `ArrayWrite(n)` compare the index with every position of the array, using an `IsEqual` (2 constraints) and a multiplication (1 constraint) for each, so they have $3n$ non-linear constraints, e.g. 30 for an array of 10 elements.
