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
// - `in`: two signals
//
// Outputs:
// - `out`: two signals either swapped or not
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
