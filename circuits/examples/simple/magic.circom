pragma circom 2.1.0;

include "../../arrays/distinct.circom";
include "../../comparators/range.circom";

// Prove that you know an N-by-N normal Magic Square,
// i.e. one that uses each of the numbers 1, 2, ..., N^2 exactly once.
//
// Parameters:
// - n: width/height of the square
//
// Inputs:
// - in: an N-by-N square
template MagicSquare(n) {
  signal input in[n][n];

  // the magic sum of a normal magic square
  var sum = n * (n*n + 1) \ 2;

  // ensure all values are in range [1, n^2] and distinct,
  // so that each of 1, 2, ..., n^2 is used exactly once
  signal flat[n*n];
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      AssertInRange(1, n*n)(in[i][j]);
      flat[i*n + j] <== in[i][j];
    }
  }
  AssertDistinct(n*n)(flat);

  // sum diagonals
  var diags[2];
  for (var d = 0; d < n; d++) {
    diags[0] += in[d][d];     // top-left -> bottom-right
    diags[1] += in[n-1-d][d]; // bottom-left -> top-right
  }
  sum === diags[0];
  sum === diags[1];
  
  // sum rows
  var rowsums[n];
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      rowsums[i] += in[i][j];
    }
    sum === rowsums[i];
  }

  // sum columns
  var colsums[n];
  for (var j = 0; j < n; j++) {
    for (var i = 0; i < n; i++) {
      colsums[j] += in[i][j];
    }
    sum === colsums[j];
  }
}
