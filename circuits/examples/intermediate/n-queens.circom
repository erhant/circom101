pragma circom 2.1.0;

include "../../arrays/distinct.circom";
include "../../comparators/range.circom";

// LeetCode 51: N-Queens
//
// Asserts that `n` queens are placed on an `n`-by-`n` chessboard such that
// no two queens attack each other.
//
// Parameters:
// - n: width/height of the board
//
// Inputs:
// - queens: `queens[r]` is the column of the queen in row `r`
// ANCHOR: NQueens
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
// ANCHOR_END: NQueens
