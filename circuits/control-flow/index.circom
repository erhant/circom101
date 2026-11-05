pragma circom 2.1.0;

// Conditionally returns one of the signals.
//
// Inputs:
// - cond: a boolean condition, NOT constrained to be a bit here; the caller must ensure it is
// - ifTrue: signal to be returned if condition is true
// - ifFalse: signal to be returned if condition is false
//
// Outputs:
// - out: equals `cond ? ifTrue : ifFalse`
// ANCHOR: IfElse
template IfElse() {
  signal input cond;
  signal input ifTrue;
  signal input ifFalse;
  signal output out;

  out <== cond * (ifTrue - ifFalse) + ifFalse;
}
// ANCHOR_END: IfElse

// Swaps `in[0]` and `in[1]` if `cond` is true.
//
// Inputs:
// - cond: a boolean condition, NOT constrained to be a bit here; the caller must ensure it is
// - in: two signals
//
// Outputs:
// - out: the two input signals, either swapped or not
//
template Switch() {
  signal input cond;
  signal input in[2];
  signal output out[2];

  // auxillary variable to store the condition multiplication
  signal aux <== (in[1] - in[0]) * cond;

  out[0] <==  aux + in[0];
  out[1] <== -aux + in[1];
}
