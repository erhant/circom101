pragma circom 2.1.0;

// Multiply two numbers `a` and `b`.
template MultiplyGate() {
  signal input in[2];
  signal output out;

  out <== in[0] * in[1];
}

// Multiply `n` numbers.
template Multiplier(n) {
  assert(n > 1);
  signal input in[n];
  signal output out;

  signal inner[n-1];

  inner[0] <== MultiplyGate()([in[0], in[1]]);
  for(var i = 0; i < n - 2; i++) {
    inner[i+1] <== MultiplyGate()([inner[i], in[i+2]]);
  }

  out <== inner[n-2]; 
}
