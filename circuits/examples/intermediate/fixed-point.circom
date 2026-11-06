pragma circom 2.1.0;

include "../../bits/index.circom";

// A fixed-point number `x` with `F` fractional bits is stored as the integer `x * 2^F`,
// e.g. with `F = 16` the number 1.5 is stored as 98304. Negative numbers are stored as
// negative field elements, e.g. -1.5 is stored as `p - 98304`.
//
// An `N`-bit fixed-point number is one whose integer satisfies `-2^(N-1) <= x < 2^(N-1)`.

// Asserts that `in` is an `N`-bit signed number.
//
// Parameters:
// - N: number of bits, including the sign
//
// Inputs:
// - in: a signed number
// ANCHOR: AssertSigned
template AssertSigned(N) {
  signal input in;

  // shifting by `2^(N-1)` maps [-2^(N-1), 2^(N-1)) to [0, 2^N)
  AssertBits(N)(in + 2 ** (N - 1));
}
// ANCHOR_END: AssertSigned

// Divides a signed number by `2^F`, rounding down.
//
// Parameters:
// - M: number of bits of the input, including the sign
// - F: number of bits to drop
//
// Inputs:
// - in: an `M`-bit signed number
//
// Outputs:
// - out: `floor(in / 2^F)`
// ANCHOR: FixedPointRescale
template FixedPointRescale(M, F) {
  assert(F < M && M < 254);
  signal input in;
  signal output out;

  // shift to a non-negative number, which also asserts that `in` has `M` bits
  signal bits[M] <== Num2Bits(M)(in + 2 ** (M - 1));

  // drop the lowest `F` bits
  var shifted = 0;
  for (var i = F; i < M; i++) {
    shifted += bits[i] * 2 ** (i - F);
  }

  // undo the shift, which is a multiple of `2^F`
  out <== shifted - 2 ** (M - 1 - F);
}
// ANCHOR_END: FixedPointRescale

// Multiplies two fixed-point numbers.
//
// Parameters:
// - N: number of bits of the inputs, including the sign
// - F: number of fractional bits
//
// Inputs:
// - in: two `N`-bit fixed-point numbers
//
// Outputs:
// - out: their product, rounded down
// ANCHOR: FixedPointMul
template FixedPointMul(N, F) {
  signal input in[2];
  signal output out;

  AssertSigned(N)(in[0]);
  AssertSigned(N)(in[1]);

  // the product has `2F` fractional bits; it is at most `2^(2N-2)`, which is
  // the square of the smallest number `-2^(N-1)`, so it fits in `2N` bits
  signal product <== in[0] * in[1];
  out <== FixedPointRescale(2 * N, F)(product);
}
// ANCHOR_END: FixedPointMul

// Computes the dot product of two vectors of fixed-point numbers.
//
// Parameters:
// - n: length of the vectors
// - N: number of bits of the inputs, including the sign
// - F: number of fractional bits
//
// Inputs:
// - a: `n` fixed-point numbers with `N` bits
// - b: `n` fixed-point numbers with `N` bits
//
// Outputs:
// - out: `a[0] * b[0] + ... + a[n-1] * b[n-1]`, rounded down
// ANCHOR: FixedPointDot
template FixedPointDot(n, N, F) {
  signal input a[n];
  signal input b[n];
  signal output out;

  // sum the products with `2F` fractional bits, without rescaling them one by one
  signal products[n];
  var sum = 0;
  for (var i = 0; i < n; i++) {
    AssertSigned(N)(a[i]);
    AssertSigned(N)(b[i]);
    products[i] <== a[i] * b[i];
    sum += products[i];
  }

  // each product is at most `2^(2N-2)`, so their sum is less than `2^(2N-2+nbits(n))`
  out <== FixedPointRescale(2 * N + nbits(n), F)(sum);
}
// ANCHOR_END: FixedPointDot
