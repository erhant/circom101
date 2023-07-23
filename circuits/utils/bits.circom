pragma circom 2.1.0;

// Returns the minimum number of bits needed to represent `n`
function numBits(n) {
  var tmp = 1, ans = 1;
  while (tmp < n) {
    ans++;
    tmp <<= 1;
  }
  return ans + 1;
}

// Converts a number to bits while asserting that
// is is `n`-bit representable.
template Num2Bits(n) {
  assert(n < 254);
  signal input in;
  signal output out[n];

  var lc = 0;
  var bit_value = 1;

  for (var i = 0; i < n; i++) {
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
  signal input  in[n];
  signal output out;

  var lc = 0;
  var bit_value = 1;
  for (var i = 0; i < n; i++) {
    in[i] * (in[i] - 1) === 0;

    lc += in[i] * bit_value;
    bit_value <<= 1;
  }

  out <== lc;
}

// Asserts that a number is `n`-bit representable.
template AssertBits(n) {
  assert(n < 254);
  signal input in;
  
  var lc = 0;
  var bit_value = 1;
  signal bits[n];
  for (var i = 0; i < n; i++) {
    bits[i] <-- (in >> i) & 1;
    bits[i] * (bits[i] - 1) === 0;

    lc += bits[i] * bit_value;
    bit_value <<= 1;
  }

  lc === in;
}