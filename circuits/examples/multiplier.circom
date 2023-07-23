pragma circom 2.1.0;

// Multiply two numbers.
template Mul() {
  signal input in[2];
  signal output out;

  out <== in[0] * in[1];
}

// Multiply `n` numbers using `Mul` gates.
template MultiplierGated(n) {
  assert(n > 1);
  signal input in[n];
  signal output out;

  signal inner[n-1];

  inner[0] <== Mul()([in[0], in[1]]);
  for(var i = 0; i < n - 2; i++) {
    inner[i+1] <== Mul()([inner[i], in[i+2]]);
  }

  out <== inner[n-2]; 
}

// Multiply `n` numbers.
template Multiplier(n) {
  assert(n > 1);
  signal input in[n];
  signal output out;

  signal inner[n-1];

  inner[0] <== in[0] * in[1];
  for(var i = 0; i < n - 2; i++) {
    inner[i+1] <== inner[i] * in[i+2];
  }

  out <== inner[n-2]; 
}