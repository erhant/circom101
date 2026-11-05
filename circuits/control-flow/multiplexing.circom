pragma circom 2.1.0;

// "2-to-1" multiplexer.
//
// Inputs:
// - in: inputs
// - sel: selector bit, NOT constrained to be a bit here; the caller must ensure it is
//
// Outputs:
// - out: equals in[sel]
// ANCHOR: Mux1
template Mux1() {
  signal input in[2];
  signal input sel;
  signal output out;

  out <== (in[1] - in[0]) * sel + in[0];
}
// ANCHOR_END: Mux1

// "4-to-1" multiplexer.
//
// Inputs:
// - in: inputs
// - sel: selector bits, NOT constrained to be bits here; the caller must ensure they are
//
// Outputs:
// - out: equals in[2*sel[1] + sel[0]]
// ANCHOR: Mux2
template Mux2() {
  signal input in[4];
  signal input sel[2];
  signal output out;

  // due to multiplication we need an auxiliary signal
  signal sel_0_sel_1 <== sel[1] * sel[0];

  signal a11 <== (in[3] - in[2] - in[1] + in[0]) * sel_0_sel_1;
  signal a10 <== (in[2] - in[0]) * sel[1];
  signal a01 <== (in[1] - in[0]) * sel[0];
  signal a00 <== in[0];

  out <== (a11 + a10 + a01 + a00);
}
// ANCHOR_END: Mux2

