pragma circom 2.1.0;

// Returns the minimum number of bits needed to represent `n`
//
// Inputs:
// - n: a number
function nbits(n) {
  var ans = 0;

  var tmp = 1;
  while (tmp - 1 < n) {
      ans++;
      tmp <<= 1;
  }
  
  return ans;
}

// Asserts that a given input is binary.
//
// Inputs:
// - in: an input signal, expected to be 0 or 1.
template AssertBit() {
  signal input in;
  in * (in - 1) === 0;
}


// Converts a number to bits while asserting that
// it is `n`-bit representable.
//
// Parameters:
// - n: number of bits
//
// Inputs:
// - in: an input signal
//
// Outputs:
// - out: `n`-bits, with `out[0]` being the least-significant bit
// and `out[n-1]` being the most-significant bit.
template Num2Bits(n) {
  assert(n < 254);
  signal input in;
  signal output out[n];

  var lc = 0;
  var bit_value = 1;

  for (var i = 0; i < n; i++) {
    out[i] <-- (in >> i) & 1;
    AssertBit()(out[i]);

    lc += out[i] * bit_value;
    bit_value <<= 1;
  }

  lc === in;
}

// Converts an `n`-bit number in binary form to decimal form.
//
// Parameters:
// - n: number of bits
//
// Inputs:
// - in: `n`-bits, with `in[0]` being the least-significant bit
// and `in[n-1]` being the most-significant bit
//
// Outputs:
// - out: the signal value corresponding to the given bits
template Bits2Num(n) {
  assert(n < 254);
  signal input in[n];
  signal output out;

  var lc = 0;
  var bit_value = 1;
  for (var i = 0; i < n; i++) {
    AssertBit()(in[i]);

    lc += in[i] * bit_value;
    bit_value <<= 1;
  }

  out <== lc;
}

// Asserts that a number is `n`-bit representable.
//
// Parameters:
// - n: number of bits
//
// Inputs:
// - in: an input signal
template AssertBits(n) {
  assert(n < 254);
  signal input in;
  
  var lc = 0;
  var bit_value = 1;
  signal bits[n];
  for (var i = 0; i < n; i++) {
    bits[i] <-- (in >> i) & 1;
    AssertBit()(bits[i]);

    lc += bits[i] * bit_value;
    bit_value <<= 1;
  }

  lc === in;
}
