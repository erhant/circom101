pragma circom 2.1.0;

// Note that none of these gates constrain their inputs to be bits;
// the caller must ensure that, e.g. with `AssertBit`.

// Logical AND operation.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
// ANCHOR: AND
template AND() {
  signal input in[2];
  signal output out;

  out <== in[0]*in[1];
}
// ANCHOR_END: AND

// Logical OR operation.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
// ANCHOR: OR
template OR() {
  signal input in[2];
  signal output out;

  out <== in[0] + in[1] - in[0]*in[1];
}
// ANCHOR_END: OR

// Logical XOR operation.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
// ANCHOR: XOR
template XOR() {
  signal input in[2];
  signal output out;

  out <== in[0] + in[1] - 2*in[0]*in[1];
}
// ANCHOR_END: XOR

// Logical NOT operation.
//
// Inputs:
// - in: a bit-signal
//
// Outputs:
// - out: result of the logical operation
// ANCHOR: NOT
template NOT() {
  signal input in;
  signal output out;

  out <== 1 - in;
}
// ANCHOR_END: NOT

// Logical NAND operation, i.e. AND followed by NOT.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
// ANCHOR: NAND
template NAND() {
  signal input in[2];
  signal output out;

  out <== 1 - (in[0]*in[1]);
}
// ANCHOR_END: NAND

// Logical NOT operation, i.e. OR followed by NOT.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
// ANCHOR: NOR
template NOR() {
  signal input in[2];
  signal output out;

  out <== 1 - (in[0] + in[1] - in[0]*in[1]);
}
// ANCHOR_END: NOR
