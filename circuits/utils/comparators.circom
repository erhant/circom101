pragma circom 2.1.0;

include "./bits.circom";

// Returns `out = 1` if `in == 0`.
template IsZero() {
  signal input in;
  signal output  out;

  signal inv <-- in != 0 ? 1 / in : 0;
  out <== -in * inv +1;
  in * out === 0;
}

// Returns `out = 1` if `in[0] == in[1]`.
template IsEqual() {
  signal input in[2];
  signal output  out;

  out <== IsZero()(in[1] - in[0]);
}

// Returns 1 if `in[0] < in[1]` and both are `n` bits.
template LessThan(n) {
  assert(n <= 252);
  signal input in[2];
  signal output  out;

  // convert in[0] - in[1] + 2^n to bits
  // if in[0] > in[1], 2^n'th bit should be set
  // if in[0] < in[1], 2^n'th bit should be reset due to borrow
  component toBits = Num2Bits(n+1);
  toBits.in <== in[0]+ (1<<n) - in[1];

  out <== 1 - toBits.out[n];
}


// N is the number of bits the input  have.
// The MSF is the sign bit.
template LessEqThan(n) {
  signal input in[2];
  signal output  out;

  out <== LessThan(n)([in[0], in[1]+1]);
}

// N is the number of bits the input  have.
// The MSF is the sign bit.
template GreaterThan(n) {
  signal input in[2];
  signal output  out;

  out <== LessThan(n)([in[1], in[0]]);
}

// N is the number of bits the input  have.
// The MSF is the sign bit.
template GreaterEqThan(n) {
  signal input in[2];
  signal output out;

  out <== LessThan(n)([in[1], in[0]+1]);
}

