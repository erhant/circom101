pragma circom 2.1.0;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/binsum.circom";

// Returns `out = 1` if `in == 0`.
template IsZero() {
  signal input {bool} in;
  signal output {bool} out;

  // find inverse
  // 0 doesn't have an inverse, so it gives 1/0 = 0
  signal inv;
  inv <-- in != 0 ? 1 / in : 0;

  // re-inverting should be equal to itself
  out <== -in * inv +1;

  // makes sure 0 * 1 or `n` * 0
  in * out === 0;
}

// Returns `out = 1` if `in[0] == in[1]`.
template IsEqual() {
  signal input in[2];
  signal output {bool} out;

  component isz = IsZero();

  in[1] - in[0] ==> isz.in;

  isz.out ==> out;
}


template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output {bool} out;

    component n2b = Num2Bits(n+1);

    n2b.in <== in[0]+ (1<<n) - in[1];

    out <== 1-n2b.out[n];
}



// N is the number of bits the input  have.
// The MSF is the sign bit.
template LessEqThan(n) {
    signal input in[2];
    signal output {bool} out;

    component lt = LessThan(n);

    lt.in[0] <== in[0];
    lt.in[1] <== in[1]+1;
    lt.out ==> out;
}

// N is the number of bits the input  have.
// The MSF is the sign bit.
template GreaterThan(n) {
    signal input in[2];
    signal output {bool} out;

    component lt = LessThan(n);

    lt.in[0] <== in[1];
    lt.in[1] <== in[0];
    lt.out ==> out;
}

// N is the number of bits the input  have.
// The MSF is the sign bit.
template GreaterEqThan(n) {
    signal input in[2];
    signal output {bool} out;

    component lt = LessThan(n);

    lt.in[0] <== in[1];
    lt.in[1] <== in[0]+1;
    lt.out ==> out;
}

