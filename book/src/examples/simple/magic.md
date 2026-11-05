# Magic Square

A magic square is an `n`-by-`n` grid of numbers where every row, every column and both diagonals add up to the same number, called the _magic sum_. A _normal_ magic square additionally uses each of the numbers `1, 2, ..., n^2` exactly once. Here is the classic 3-by-3 one, with magic sum 15:

```
4 9 2
3 5 7
8 1 6
```

## `MagicSquare`

```cs
{{#include ../../../../circuits/examples/simple/magic.circom:MagicSquare}}
```

With this circuit you can prove that you know a normal `n`-by-`n` magic square without revealing it. The square `in` is the only input, and it is private.

## The Magic Sum

The magic sum is not an input, because for a normal magic square it is fixed by `n`. The numbers `1, ..., n^2` add up to $n^2(n^2+1)/2$, and they are split evenly over `n` rows, so each row (and likewise each column and diagonal) must add up to

$$\frac{n(n^2+1)}{2}$$

e.g. 15 for $n = 3$ and 34 for $n = 4$. Since this is known at compile time, we compute it as a `var`. We use `\`, which is integer division in Circom, rather than `/`, which is division in the field. The two agree here because $n(n^2+1)$ is always even, but `\` makes the intent clear.

## Summing with Variables

Notice that we never create a signal for the intermediate sums. `diags`, `rowsums` and `colsums` are all `var`s, so each of them simply builds up a linear expression over the input signals. When we finally write

```cs
sum === rowsums[i];
```

Circom emits a single constraint `in[i][0] + in[i][1] + ... + in[i][n-1] = sum`, with `sum` being a constant. There is no need to store each partial sum in its own signal. All we need is one constraint per line:

- `n` constraints for the rows,
- `n` constraints for the columns,
- `2` constraints for the diagonals,

for a total of `2n + 2` constraints. These are all **linear** constraints though, so they are free: the compiler eliminates them by expressing some of the signals in terms of the others. The sums cost 0 non-linear constraints!

## Using Each Number Once

The sums alone are not enough. Without any checks on the values, the circuit would happily accept squares that are not very magical at all, such as:

```
5 5 5     6  0 9
5 5 5     8  5 2
5 5 5     1 10 4
```

Every line adds up to 15 in both of them, but the first one repeats `5`, and the second one uses `0` and `10`. On top of that, every value is a field element, so a prover could also fill the grid with "negative" numbers (very large field elements) that happen to add up correctly.

To rule these out, we reuse two templates from earlier chapters, [range checks](../../comparators/range-check.md) and [distinct values](../../arrays/distinct.md):

```cs
signal flat[n*n];
for (var i = 0; i < n; i++) {
  for (var j = 0; j < n; j++) {
    AssertInRange(1, n*n)(in[i][j]);
    flat[i*n + j] <== in[i][j];
  }
}
AssertDistinct(n*n)(flat);
```

Every value is now in `[1, n^2]`, and there are `n^2` distinct values, so the grid must contain each of `1, ..., n^2` exactly once. We flatten the square into `flat` because `AssertDistinct` expects a one-dimensional array.

Both checks are needed. With only the range check, the all-`5`s square is still accepted. With only the distinctness check, the second square above is still accepted.

So all of the cost of this circuit comes from these checks, as the sums are free.

## Constraint Count

| Square | Constraints |
| ------ | ----------- |
| 3-by-3 | 144         |
| 4-by-4 | 400         |

For the 3-by-3 square, 72 constraints are for the range checks (8 per cell), and 72 for `AssertDistinct`, which compares every pair of the 9 cells. The sums, as we have seen, are free.

The same pattern of "check the sums, the ranges and the distinctness" shows up again, at a larger scale, in the [Sudoku](../intermediate/sudoku.md) example.
