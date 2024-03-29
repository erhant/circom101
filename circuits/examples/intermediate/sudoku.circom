pragma circom 2.1.0;

include "../../bits/index.circom";
include "../../arrays/distinct.circom";
include "../../comparators/index.circom";
include "../../comparators/range.circom";

// Asserts that a solution is valid w.r.t a given public puzzle of an NxN square board.
//
// Parameters:
// - n_sqrt: Square root of `N` as described above 
//
// Inputs:
// - solution[N][N]: the solution
// - puzzle[N][N]: the initial puzzle board
template Sudoku(n_sqrt) {
  var n = n_sqrt * n_sqrt;     // board size is a perfect square
  signal input solution[n][n]; // solution is a 2D array of numbers
  signal input puzzle[n][n];   // puzzle is the same, but a zero indicates a blank

  // ensure that solution & puzzle agrees
  for (var row_i = 0; row_i < n; row_i++) {
    for (var col_i = 0; col_i < n; col_i++) {
      // puzzle is either empty (0), or the same as solution
      puzzle[row_i][col_i] * (puzzle[row_i][col_i] - solution[row_i][col_i]) === 0;
    } 
  }

  // ensure all values in the solution are in range
  for (var row_i = 0; row_i < n; row_i++) {
    for (var col_i = 0; col_i < n; col_i++) {
      AssertInRange(1, n)(solution[row_i][col_i]);
    }
  }

  // ensure all values in a row are distinct
  component distinctRows[n];
  for (var row_i = 0; row_i < n; row_i++) {
    for (var col_i = 0; col_i < n; col_i++) {
      if (row_i == 0) {
        distinctRows[col_i] = AssertDistinct(n);
      }
      distinctRows[col_i].in[row_i] <== solution[row_i][col_i];
    }
  }

  // ensure all values in a column are distinct
  component distinctCols[n];
  for (var col_i = 0; col_i < n; col_i++) {
    for (var row_i = 0; row_i < n; row_i++) {
      if (col_i == 0) {
        distinctCols[row_i] = AssertDistinct(n);
      }
      distinctCols[row_i].in[col_i] <== solution[row_i][col_i];
    }
  }

  // ensure that all values in squares are distinct
  component distinctSquares[n];
  var s_i = 0;
  for (var sr_i = 0; sr_i < n_sqrt; sr_i++) {
    for (var sc_i = 0; sc_i < n_sqrt; sc_i++) {
      // square index
      distinctSquares[s_i] = AssertDistinct(n);
      
      // (r, c) now marks the start of this square
      var r = sr_i * n_sqrt;
      var c = sc_i * n_sqrt;

      var i = 0;
      for (var row_i = r; row_i < r + n_sqrt; row_i++) {
        for (var col_i = c; col_i < c + n_sqrt; col_i++) {
          distinctSquares[s_i].in[i] <== solution[row_i][col_i];
          i++;
        }
      }

      s_i++;
    }
  }
}
