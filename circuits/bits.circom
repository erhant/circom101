pragma circom 2.1.0;

// Asserts that a given number is representable by `n` bits.
template AssertBits(n) {
  assert(n < 254);
  signal input in;

  var sum = 0;
  var bit_value = 1;

  for (var i = 0; i<n; i++) {
    out[i] <-- (in >> i) & 1;
    out[i] * (out[i] - 1) === 0;
    sum += out[i] * bit_value;
    bit_value <<= 1;
  }

  sum === in;
}

// Converts a number to bits.
template Num2Bits(n) {
  assert(n < 254);
  signal input in;
  signal output {binary} out[n];

  var lc = 0;
  var bit_value = 1;

  for (var i = 0; i<n; i++) {
    out[i] <-- (in >> i) & 1;
    out[i] * (out[i] - 1) === 0;
    lc += out[i] * bit_value;
    bit_value <<= 1;
  }

  lc === in;
}

// Converts a bit-array to a number.
template Bits2Num(n) {
  assert(n < 254);
  signal input in[n];
  signal output {binary} out;

  var lc = 0;
  var bit_value = 1;
  for (var i = 0; i < n; i++) {
    in[i] * (in[i] - 1) === 0;
    lc += in[i] * bit_value;
    bit_value <<= 1;
  }

  out <== lc;
}