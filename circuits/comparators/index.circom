pragma circom 2.1.0;

include "../bits/index.circom";

// Returns a bit-signal indicating whether the input signal is 0.
//
// Inputs:
// - in: input signal
//
// Outputs:
// - out: 1 if `in` is zero, 0 otherwise.
// ANCHOR: IsZero
template IsZero() {
  signal input in;
  signal output out;

  signal inv <-- in != 0 ? 1 / in : 0;
  out <== 1 - (in * inv);

  in * out === 0;
}
// ANCHOR_END: IsZero

// Returns a bit-signal indicating whether the input signals are equal.
// This is equivalent to checking if their difference is zero.
//
// Inputs:
// - in[2]: two signals
//
// Outputs:
// - out: 1 if `in[0] == in[1]`, 0 otherwise.
// ANCHOR: IsEqual
template IsEqual() {
  signal input in[2];
  signal output out;

  out <== IsZero()(in[1] - in[0]);
}
// ANCHOR_END: IsEqual

// Returns a bit-signal indicating whether `in[0] < in[1]` and both are `n` bits.
// The inputs are NOT range-checked here: if one of the signals is larger than
// `n` bits, the result may be silently wrong, e.g. `-1 < 0` (where `-1` is a large
// field element) returns 1. The caller must ensure that both inputs are `n` bits.
//
// Parameters:
// - n: number of bits
//
// Inputs:
// - in[2]: two signals
//
// Outputs:
// - out: 1 if `in[0] < in[1]`, 0 otherwise.
// ANCHOR: LessThan
template LessThan(n) {
  assert(n <= 252);
  signal input in[2];
  signal output out;

  // convert in[0] - in[1] + 2^n to bits
  // if in[0] > in[1], 2^n'th bit should be set
  // if in[0] < in[1], 2^n'th bit should be reset due to subtraction borrow
  component toBits = Num2Bits(n+1);
  toBits.in <== ((1 << n) + in[0]) - in[1];

  out <== 1 - toBits.out[n];
  _ <== toBits.out; // only the n'th bit is needed
}
// ANCHOR_END: LessThan

// Returns a bit-signal indicating whether `in[0] <= in[1]` and both are `n` bits.
// If one of the signals is larger than `n` bits, this will give an error.
//
// Parameters:
// - n: number of bits
//
// Inputs:
// - in[2]: two signals
//
// Outputs:
// - out: 1 if `in[0] <= in[1]`, 0 otherwise.
// ANCHOR: LessEqThan
template LessEqThan(n) {
  signal input in[2];
  signal output out;

  out <== LessThan(n)([in[0], in[1]+1]);
}
// ANCHOR_END: LessEqThan

// Returns a bit-signal indicating whether `in[0] > in[1]` and both are `n` bits.
// If one of the signals is larger than `n` bits, this will give an error.
//
// Parameters:
// - n: number of bits
//
// Inputs:
// - in[2]: two signals
//
// Outputs:
// - out: 1 if `in[0] > in[1]`, 0 otherwise.
// ANCHOR: GreaterThan
template GreaterThan(n) {
  signal input in[2];
  signal output out;

  out <== LessThan(n)([in[1], in[0]]);
}
// ANCHOR_END: GreaterThan

// Returns a bit-signal indicating whether `in[0] >= in[1]` and both are `n` bits.
// If one of the signals is larger than `n` bits, this will give an error.
//
// Parameters:
// - n: number of bits
//
// Inputs:
// - in[2]: two signals
//
// Outputs:
// - out: 1 if `in[0] >= in[1]`, 0 otherwise.
// ANCHOR: GreaterEqThan
template GreaterEqThan(n) {
  signal input in[2];
  signal output out;

  out <== LessThan(n)([in[1], in[0]+1]);
}
// ANCHOR_END: GreaterEqThan

