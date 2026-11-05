pragma circom 2.1.0;

include "../comparators/index.circom";

// Returns a boolean indicating that an array is sorted (ascending).
//
// Parameters:
// - n: length of `in`
// - b: max number of bits in the values of `in`
//
// Inputs:
// - in: an array of `n` `b`-bit values
//
// Outputs:
// - out: a boolean indicating whether the array is sorted
// ANCHOR: IsSorted
template IsSorted(n, b) {
  signal input in[n];
  signal output out;

  // range check
  for (var i = 0; i < n; i++) {
    _ <== Num2Bits(b)(in[i]);
  }

  // accumulator for in[i-1] <= in[i] checks
  var acc = 0;
  for (var i = 1; i < n; i++) {
    var isLessThan = LessEqThan(b)([in[i-1], in[i]]);
    acc += isLessThan;
  }

  // sorted only if all `n - 1` pairs are ordered
  out <== IsEqual()([acc, n - 1]);
}
// ANCHOR_END: IsSorted

// Asserts that an array is sorted (ascending).
//
// Parameters:
// - n: length of `in`
// - b: max number of bits in the values of `in`
//
// Inputs:
// - in: an array of `n` `b`-bit values
// ANCHOR: AssertSorted
template AssertSorted(n, b) {
  signal input in[n];

  // range check
  for (var i = 0; i < n; i++) {
    _ <== Num2Bits(b)(in[i]);
  }

  // accumulator for in[i-1] <= in[i] checks
  var acc = 0;
  for (var i = 1; i < n; i++) {
    var isLessThan = LessEqThan(b)([in[i-1], in[i]]);
    acc += isLessThan;
  }

  acc === n - 1;
}
// ANCHOR_END: AssertSorted
