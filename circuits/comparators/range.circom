pragma circom 2.1.0;

include "../bits/index.circom";

// Asserts that `in` is in range [MIN, MAX].
// In other words, `MIN <= in <= MAX`.
//
// Parameters:
// - MIN: minimum allowed value
// - MAX: maximum allowed value
//
// Inputs:
// - in: an input signal
template AssertInRange(MIN, MAX) {
  assert(MIN < MAX);
  signal input in;
  
  var b = nbits(MAX); 
  
  // find `in - MIN`:
  // if `in > MIN` this is a b-bit value
  // otherwise, it will underflow due to negation,
  // and may be larger than MAX
  component lowerBound = AssertBits(b);
  lowerBound.in <== in - MIN;                // e.g. 1 - 1 = 0 (for 0 <= in)

  // find `in + 2^b - MAX - 1`
  // if `in < MAX` this will result in a value less than `2^b - 1`
  // ensuring that it is a b-bit value, otherwise this will be a value
  // larger than b-bits
  component upperBound = AssertBits(b);
  upperBound.in <== in + (2 ** b) - MAX - 1; // e.g. 9 + (15 - 9) = 15 (for in <= 15)
}
