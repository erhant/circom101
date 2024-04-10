pragma circom 2.1.0;

include "./compconstant.circom";

// Returns the sign of a 254-bit value within the prime field.
// If a number is closer to zero than it is to the order of the field,
// it is defined to be positive; otherwise negative.
//
// Inputs:
// - in: 254-bit binary representation of a number
//
// Outputs:
// - out: 0 if positive, 1 if negative.
template Sign() {
  signal input in[254];
  signal output out;

  var half = 1 / 2;
  component comparator = CompConstant(half - 1);
  for (var i = 0; i < 254; i++) {
      comparator.in[i] <== in[i];
  }

  out <== comparator.out;
}
