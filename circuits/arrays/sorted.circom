pragma circom 2.1.0;

include "../comparators/index.circom";

// Returns a boolean indicating that an array is sorted.
//
// Parameters:
// - n: length of `in`
// - m: max number of bits in the values of `in`
//
// Inputs:
// - in: an array of `n` `m`-bit values
//
// Outputs:
// - out: a boolean indicating whether the array is sorted
template IsSorted(n, m) {
  signal input in[n];
  signal output out;

  var acc = 0;
  for (var i = 1; i < n; i++) {
    var isLessThan = LessThan()([in[i-1], in[i]]);
    acc += isLessThan;
  }

  // note that technically it is possible for `acc` to overflow
  // and wrap back to 0, however, that is unlikely to happen given
  // how large the prime-field is and we would need that many components
  // to be able to overflow
  signal outs <== acc;
  out <== IsZero()(outs);
}
