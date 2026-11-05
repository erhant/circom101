# Two Sum

This is [LeetCode 1](https://leetcode.com/problems/two-sum/), perhaps the most famous coding interview question: given an array `nums` and a `target`, find two different indices `i` and `j` such that `nums[i] + nums[j] = target`. For example, for `nums = [2, 7, 11, 15]` and `target = 9`, the answer is `i = 0, j = 1`.

## `TwoSum`

```cs
{{#include ../../../../circuits/examples/intermediate/two-sum.circom:TwoSum}}
```

## Verify, Don't Search

The brute-force solution tries all pairs, which takes $O(n^2)$ time. The famous solution uses a hashmap to find the pair in $O(n)$ time:

```ts
function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>();
  for (let j = 0; j < nums.length; j++) {
    const i = seen.get(target - nums[j]);
    if (i !== undefined) {
      return [i, j];
    }
    seen.set(nums[j], j);
  }
  throw new Error("no solution");
}
```

Neither of these is a good fit for a circuit. Trying all pairs would cost $O(n^2)$ constraints, and there are no hashmaps in a circuit.

Instead, we do not search at all! The prover runs the hashmap solution _outside_ of the circuit, and gives the indices `i` and `j` as inputs. The circuit only **verifies** that they are a solution, which is much simpler:

```cs
signal a <== ArrayRead(n)(nums, i);
signal b <== ArrayRead(n)(nums, j);
a + b === target;
```

This is a recurring idea in zero-knowledge circuits: finding an answer may be hard, but checking it is often easy, and the circuit only needs to do the latter. We have seen this before with [integer division](../../arithmetic/int-div.md), where the quotient is computed outside the circuit and only checked inside.

## Checking the Indices

Since the indices come from the prover, the circuit must make sure that they are valid.

### Different Indices

The two indices must be different, otherwise `nums = [2, 7, 11, 15]` with `target = 4` would be "solved" by using the 2 twice. We require `i < j`, which also makes the order of the answer unique:

```cs
signal isLess <== LessThan(nbits(n - 1))([i, j]);
isLess === 1;
```

### Indices Within the Array

This one is easy to miss. Recall that [`ArrayRead`](../../arrays/) returns 0 if the index is not within the array. So without a range check, the prover could use an index that is out of bounds to read a 0:

- `nums = [2, 7, 11, 15]` with `target = 2` is "solved" by `i = 0, j = 4`, since `2 + 0 = 2`.
- The same works with a "negative" index such as `i = -1`, which is a very large number in the field.

Both of these pass the checks above if we forget the range checks! Note that `LessThan` can not help us here, as it is only correct for inputs that are already range-checked. So we assert that both indices are in range $[0, n-1]$ using [`AssertInRange`](../../comparators/range-check.md):

```cs
AssertInRange(0, n - 1)(i);
AssertInRange(0, n - 1)(j);
```

After that, `LessThan` is safe to use as well.

## Constraint Count

Most of the cost comes from the two `ArrayRead`s, each of which compares the index with every position of the array. So the circuit is $O(n)$:

| `n` | non-linear constraints |
| --- | ---------------------- |
| 4   | 34                     |
| 100 | 635                    |

For $n = 100$, the two `ArrayRead`s take 600 of these, and the range checks & `LessThan` take the rest.

> Note that the numbers are field elements, so `nums[i] + nums[j] === target` is an equation modulo the prime $p$. Since $p$ is huge, for "normal" numbers like those on LeetCode (even negative ones) this is the same as the usual equation over integers.
