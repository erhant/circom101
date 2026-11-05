# Missing Number

This is [LeetCode 268](https://leetcode.com/problems/missing-number/): given an array `nums` of `n` distinct numbers in the range $[0, n]$, find the only number in that range that is missing from the array. For example, for `nums = [3, 0, 1]` the answer is 2.

## `MissingNumber`

```cs
{{#include ../../../../circuits/examples/simple/missing-number.circom:MissingNumber}}
```

## The Famous Trick

The well-known solution is a one-liner. The numbers $0, 1, \ldots, n$ add up to $n(n+1)/2$, and exactly one of them is missing from `nums`, so:

$$
\texttt{missing} = \frac{n(n+1)}{2} - \sum_{i} \texttt{nums}[i]
$$

This is even better in a circuit than on a CPU: it is only additions and a constant, so it costs **zero** non-linear constraints!

```cs
template MissingNumber(n) {
  signal input nums[n];
  signal output out;

  var sum = 0;
  for (var i = 0; i < n; i++) {
    sum += nums[i];
  }
  out <== n * (n + 1) \ 2 - sum;
}
```

> We use `\`, which is integer division in Circom, instead of `/`, which is division in the field. The two agree here because $n(n+1)$ is always even.

## The Catch

On LeetCode, the input is guaranteed to be valid. In a circuit, nothing is guaranteed: whoever creates the proof also picks the input. The circuit above returns _some_ number for _any_ array, valid or not. For example, with $n = 3$ we have $n(n+1)/2 = 6$, and:

- `nums = [0, 0, 4]` gives 2, but `4` is out of range and `0` is repeated.
- `nums = [1, 4, 1]` gives 0, which is not even missing from a valid point of view.

A proof that "the missing number is 2" would be meaningless here. So, just like the [magic square](./magic.md), we must check the input as well:

- every number is in range $[0, n]$, using [`AssertInRange`](../../comparators/range-check.md),
- all numbers are distinct, using [`AssertDistinct`](../../arrays/distinct.md).

With these, `nums` is exactly $\{0, 1, \ldots, n\}$ with one number removed, and the formula gives the right answer.

## Constraint Count

The formula is free, but the checks are not. `AssertDistinct` compares every pair of numbers, so the cost grows quadratically:

| `n` | non-linear constraints |
| --- | ---------------------- |
| 9   | 144                    |
| 100 | 11300                  |

For $n = 100$, 9900 of these come from `AssertDistinct` and 1400 from the range checks. The famous trick that makes this problem "easy" is not where the work is: in a circuit, most of the cost goes into making sure that the input actually satisfies the assumptions of the problem.
