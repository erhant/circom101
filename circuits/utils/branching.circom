pragma circom 2.1.0;

// If-else branching.
//
// Inputs:
// - `cond`: a boolean condition
// - `ifTrue`: signal to be returned if condition is true
// - `ifFalse`: signal to be returned if condition is false
//
// Outputs:
// - `out`: equals `cond ? ifTrue : ifFalse`
//
template IfElse() {
  signal input cond;
  signal input ifTrue;
  signal input ifFalse;
  signal output out;
  
  out <== cond * (ifTrue - ifFalse) + ifFalse;
}

// Swaps in[0] ~ in[1] if `cond` is true.
//
// Inputs:
// - `cond`: a boolean condition
// - `in`: two numbers
//
// Outputs:
// - `out`: two numbers either swapped or not
//
template Switch() {
  signal input cond;
  signal input in[2];
  signal output out[2];

  out[0] <== cond * (in[1] - in[0]) + in[0];
  out[1] <== cond * (in[0] - in[1]) + in[1];
}

// TODO: add muxes