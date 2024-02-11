pragma circom 2.1.0;

// Logical AND operation.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation 
template AND() {
  signal input in[2];
  signal output out;

  out <== in[0]*in[1];
}

// Logical OR operation.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
template OR() {
  signal input in[2];
  signal output out;

  out <== in[0] + in[1] - in[0]*in[1];
}

// Logical XOR operation.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
template XOR() {
  signal input in[2];
  signal output out;

  out <== in[0] + in[1] - 2*in[0]*in[1];
}

// Logical NOT operation.
//
// Inputs:
// - in: a bit-signal
//
// Outputs:
// - out: result of the logical operation
template NOT() {
  signal input in;
  signal output out;

  out <== 1 - in;
}

// Logical NAND operation, i.e. AND followed by NOT.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
template NAND() {
  signal input in[2];
  signal output out;

  out <== 1 - (in[0]*in[1]);
}

// Logical NOT operation, i.e. OR followed by NOT.
//
// Inputs:
// - in: two bit-signals
//
// Outputs:
// - out: result of the logical operation
template NOR() {
  signal input in[2];
  signal output out;

  out <== 1 - (in[0] + in[1] - in[0]*in[1]);
}
