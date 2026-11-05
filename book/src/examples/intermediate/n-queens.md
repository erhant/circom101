# `NQueens`

```cs
template NQueens(n) {
  signal input queens[n];

  // each queen is within the board
  for (var r = 0; r < n; r++) {
    AssertInRange(0, n - 1)(queens[r]);
  }

  // there is one queen per row by definition of `queens`,
  // and there must be one queen per column as well
  AssertDistinct(n)(queens);

  // no two queens on the same diagonal, i.e. `r + c` is distinct,
  // and on the same anti-diagonal, i.e. `r - c` is distinct
  var diagonals[n];
  var antiDiagonals[n];
  for (var r = 0; r < n; r++) {
    diagonals[r] = r + queens[r];
    antiDiagonals[r] = r - queens[r];
  }
  AssertDistinct(n)(diagonals);
  AssertDistinct(n)(antiDiagonals);
}
```

This is [LeetCode 51](https://leetcode.com/problems/n-queens/): place `n` queens on an `n`-by-`n` chessboard so that no two queens attack each other. A queen attacks along its row, its column, and both of its diagonals. Here is a solution for $n = 4$:

```
. Q . .
. . . Q
Q . . .
. . Q .
```

On LeetCode, you would find all solutions with backtracking. In a circuit, just like [Sudoku](./sudoku.md), we instead **verify** a given solution: the prover finds a placement outside the circuit, and the circuit checks that it is valid.

## Representing the Board

We could take the whole board as an `n`-by-`n` array of 0s and 1s, but there is a much better representation. Since there must be exactly one queen in each row, we can describe a placement by the column of the queen in each row:

$$
\texttt{queens}[r] = \text{column of the queen in row } r
$$

The solution above is `queens = [1, 3, 0, 2]`. With this representation, "one queen per row" holds by definition, and we do not have to check it at all. Choosing a good representation of the input is often the cheapest optimization there is!

## The Checks

What is left is to check that each queen is on the board, and that no two queens share a column or a diagonal:

- **On the board:** each `queens[r]` is in range $[0, n-1]$, using [`AssertInRange`](../../comparators/range-check.md).
- **Columns:** all `queens[r]` are distinct, using [`AssertDistinct`](../../arrays/distinct.md).
- **Diagonals:** two squares $(r, c)$ and $(r', c')$ are on the same diagonal when $r - c = r' - c'$, and on the same anti-diagonal when $r + c = r' + c'$. So all `r - queens[r]` must be distinct, and so must all `r + queens[r]`.

Note that `r - queens[r]` may be negative, which is a very large number in the field. That is not a problem here, since `AssertDistinct` only checks for equality, and two field elements are equal exactly when the integers they come from are equal (for numbers this small).

## Testing

Besides testing a few valid and invalid placements, we can test the circuit against _all_ possible placements for a small board. For $n = 6$, every placement with distinct columns is a permutation of $[0, 1, \ldots, 5]$, and there are $6! = 720$ of them. The 6-queens puzzle has exactly 4 solutions, so the circuit must accept exactly 4 of these 720 permutations, which it does.

## Cost

There are three `AssertDistinct` checks of `n` values each, which compare every pair, and `n` range checks. For the classic 8-queens puzzle, the circuit has 216 non-linear constraints: 168 for the distinctness checks, and 48 for the range checks.
