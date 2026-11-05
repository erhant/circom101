# Sudoku

Sudoku is the classic example of a zero-knowledge proof: you want to convince someone that you have solved a puzzle, without showing them the solution.

## `Sudoku`

```cs
{{#include ../../../../circuits/examples/intermediate/sudoku.circom:Sudoku}}
```

The board is `n`-by-`n`, where `n` is a perfect square (4, 9, 16, ...), and it is split into `n` boxes of size `n_sqrt`-by-`n_sqrt`. That is why the template takes `n_sqrt` as its parameter rather than `n` itself: `Sudoku(3)` is the usual 9-by-9 board with 3-by-3 boxes, and `Sudoku(2)` is a small 4-by-4 board with 2-by-2 boxes.

The circuit has two inputs:

- `puzzle` is the board as it was given to you, with `0` for the blank cells. This is **public**, so that the verifier knows which puzzle you have solved.
- `solution` is your filled board. This is **private**, and it never leaves the prover.

```json
{
  "file": "examples/intermediate/sudoku",
  "template": "Sudoku",
  "params": [3],
  "pubs": ["puzzle"]
}
```

A solution is valid when all of the following hold:

1. it agrees with the puzzle on every given cell,
2. every value is in `[1, n]`,
3. every row has distinct values,
4. every column has distinct values,
5. every box has distinct values.

The circuit checks these rules one by one.

## Agreeing with the Puzzle

```cs
puzzle[row_i][col_i] * (puzzle[row_i][col_i] - solution[row_i][col_i]) === 0;
```

For every cell, we want: "either the puzzle cell is blank, or it equals the solution cell". A product is zero when either of its factors is zero, so a single multiplication encodes this "or":

- If `puzzle[row_i][col_i] = 0`, the left factor is zero and the constraint holds no matter what the solution has there.
- Otherwise the right factor must be zero, i.e. `puzzle[row_i][col_i] = solution[row_i][col_i]`.

That is one constraint per cell.

## Values in Range

```cs
AssertInRange(1, n)(solution[row_i][col_i]);
```

Each value of the solution is checked to be within `[1, n]` using the [range check](../../comparators/range-check.md) from earlier. Note that the lower bound matters just as much as the upper bound: without it, a prover could leave a cell as `0`, or use a huge field element that wraps around.

For `n = 9`, we have `MAX = 9`, which needs 4 bits, so each range check is two 4-bit decompositions, i.e. 8 constraints.

## Distinct Rows, Columns and Boxes

Every row, column and box is a group of `n` cells, and each group must contain distinct values. For this we use [`AssertDistinct`](../../arrays/distinct.md), which checks every pair of cells in a group to be non-equal.

Rows and columns are straightforward: `distinctRows[col_i]` collects column `col_i`, and `distinctCols[row_i]` collects row `row_i`.

> The names are swapped compared to what is collected, i.e. `distinctRows` collects the columns and `distinctCols` collects the rows. It makes no difference for correctness: between the two of them every row and every column is checked.

Boxes need a bit more indexing. We walk over the boxes with `(sr_i, sc_i)`, compute the top-left corner of the current box as `(r, c) = (sr_i * n_sqrt, sc_i * n_sqrt)`, and then feed the `n_sqrt * n_sqrt = n` cells of that box into `distinctSquares[s_i]` one after the other. For a 4-by-4 board, the boxes are:

```
+-----+-----+
| 0 0 | 1 1 |
| 0 0 | 1 1 |
+-----+-----+
| 2 2 | 3 3 |
| 2 2 | 3 3 |
+-----+-----+
```

### Why This Is Enough

Together, the range check and the distinctness checks pin down each group completely. A row has `n` cells, every cell is in `[1, n]`, and no two cells are equal. There is only one way to fit `n` distinct values into `n` possible numbers, so every row is exactly a permutation of `1, 2, ..., n`. The same holds for every column and every box, which is precisely the rule of Sudoku.

Neither check is enough on its own. Without the range check, a row such as `10 20 30 ...` would be distinct. Without the distinctness check, a row of all `5`s would be in range.

## Constraint Count

There are `3n` groups to check for distinctness, and each `AssertDistinct(n)` compares `n(n-1)/2` pairs. This quadratic term is what dominates the circuit:

| Board  | Constraints |
| ------ | ----------- |
| 4-by-4 | 256         |
| 9-by-9 | 2673        |

For the 9-by-9 board, these break down as:

- 81 constraints for agreeing with the puzzle (one per cell),
- 648 constraints for the range checks (8 per cell),
- 1944 constraints for the distinctness checks (27 groups, 72 each).

## Testing

The interesting tests are the ones that should **fail**. For each rule, we take a correct solution, break that single rule, and expect the witness calculation to fail:

- copy a value within a row, a column or a box,
- put a `0` or an `n + 1` into a cell,
- give a puzzle whose clue disagrees with the solution.

One gotcha: when making these "bad" inputs, make sure you copy the board instead of editing it in place. A spread such as `{ ...INPUT }` only copies the top level, so `badInput.solution[0][0] = ...` would also change `INPUT.solution`. Every later test would then start from an already broken board, and could pass for the wrong reason.

```ts
const withCell = (i: number, j: number, value: number) => {
  const solution = INPUT.solution.map((row) => [...row]);
  solution[i][j] = value;
  return { ...INPUT, solution };
};

it("should NOT accept non-distinct rows", async () => {
  await circuit.expectFail(withCell(0, 0, INPUT.solution[0][1]));
});
```
