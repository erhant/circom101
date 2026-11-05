# Sorted

If we need an array to be sorted, we could sort the array out-of-circuit and pass in the sorted array, finally asserting that it is sorted indeed. To do this, we can simply check that consecutive elements are ordered, that is $a_{i-1} \leq a_{i}$ for all $1 \leq i \lt n$.

## `IsSorted`

```cs
{{#include ../../../circuits/arrays/sorted.circom:IsSorted}}
```

Since the correctness of `LessEqThan(b)` is guaranteed only for inputs of at most `b` bits, we also add a range check using `Num2Bits(b)`, which internally asserts that the input fits within `b` bits.

Each `LessEqThan` returns 1 for an ordered pair, so `acc` counts the ordered pairs. There are $n-1$ pairs, and the array is sorted only if **all** of them are ordered, so we return whether `acc` equals $n-1$.

> Be careful to not check whether `acc` is non-zero instead: that only tells that _some_ pair is ordered, and an array like `[0, 1, 2, 4, 3]` would be considered sorted!

## `AssertSorted`

```cs
{{#include ../../../circuits/arrays/sorted.circom:AssertSorted}}
```

If you would like to **assert** that the array is sorted instead of returning 0 or 1, you can simply constrain `acc === n-1` at the end, instead of comparing it with `IsEqual`.

## Constraint Count

Both circuits range-check each element with `Num2Bits(b)`, and compare each consecutive pair with `LessEqThan(b)`, for a total of $nb + (n-1)(b+1)$ non-linear constraints; `IsSorted` has two more for its final `IsEqual`. For 10 elements of 16 bits, `AssertSorted` has 313 constraints and `IsSorted` has 315.
