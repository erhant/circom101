pragma circom 2.1.0;

include "./compconstant.circom";

// Asserts that a 254-bit value is within the prime field.
//
// Inputs:
// - in: 254-bit binary representation of a number
template AliasCheck() {
  signal input in[254];

  component comparator = CompConstant(-1);
  for (var i = 0; i < 254; i++) {
    comparator.in[i] <== in[i];
  }

  comparator.out === 0;
}
