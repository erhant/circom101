pragma circom 2.1.0;

// Prove that you know an N-by-N Magic Square with the magic `sum`.
//
// Parameters:
// - n: width/height of the square
//
// Inputs:
// - in: an N-by-N square
//
// Outputs:
// - sum: the magic sum
template MagicSquare(n) {
  signal input in[n][n];
  signal output sum;

  // sum diagonals
  var diags[2];
  for (var d = 0; d < n; d++) {
    diags[0] += in[d][d];     // top-left -> bottom-right
    diags[1] += in[n-1-d][d]; // bottom-left -> top-right
  }
  sum <== diags[0]; // assign this one
  sum === diags[1]; // check others with equality
  
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

  // TODO: complete circuit
}
