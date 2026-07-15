pragma circom 2.1.0;

include "../bits/index.circom";

// Compares a signal against a constant (compile-time known) value.
// If `in` is greater than constant, returns 1.
//
// Parameters:
// - constant: a constant value
//
// Inputs:
// - in: 254-bit binary representation of a number
//
// Outputs:
// - out: 1 if `in > constant`
template CompConstant(constant) {
  signal input in[254];
  signal output out;

  // `a` is the penalty added when the signal pair is LESS than the constant pair.
  // `b` is the reward added when the signal pair is GREATER than the constant pair.
  //
  // They start at a=1, b=2^128-1 and converge toward each other, doubling the
  // step each iteration. At pair i: a_i = 2^i, b_i = 2^128 - 2^i.
  //
  // The key invariant: a single "win" at position i (contributing b_i = 2^128 - 2^i)
  // always outweighs all possible "losses" at lower positions combined
  // (worst case: sum of a_j for j < i = 2^i - 1 < b_i).
  // So the most-significant differing pair decides the outcome — just like
  // ordinary magnitude comparison.
  var a = 1;
  var b = (1 << (128)) - 1;

  var sum = 0;
  var bit_value = 1;

  signal parts[127];
  signal out_bits;
  for (var i = 0; i < 127; i++) {
    // Extract the i-th 2-bit digit of the constant (bit positions i*2 and i*2+1)
    var constant_lsb = (constant >> (i*2)) & 1;
    var constant_msb = (constant >> (i*2 + 1)) & 1;

    // Extract the i-th 2-bit digit of the input signal
    var in_lsb = in[i*2];
    var in_msb = in[i*2 + 1];

    // part_bit_a: 1 iff the signal's 2-bit digit >= the constant's 2-bit digit
    // part_bit_b: 1 iff the signal's 2-bit digit >  the constant's 2-bit digit
    //
    // These are computed using boolean arithmetic on the input bits.
    // Note: x + y - x*y = OR(x, y), and x*y = AND(x, y).
    var part_bit_a;
    var part_bit_b;
    /**/ if ((constant_msb == 0) && (constant_lsb == 0)) {
      // constant pair = 0: signal >= 0 is always true; signal > 0 iff any bit set
      part_bit_a = 1;
      part_bit_b = in_msb + in_lsb - in_msb*in_lsb;       // OR(msb, lsb)
    }
    else if ((constant_msb == 0) && (constant_lsb == 1)) {
      // constant pair = 1: signal >= 1 iff any bit set; signal > 1 iff msb set
      part_bit_a = in_msb + in_lsb - in_msb*in_lsb;       // OR(msb, lsb)
      part_bit_b = in_msb;
    }
    else if ((constant_msb == 1) && (constant_lsb == 0)) {
      // constant pair = 2: signal >= 2 iff msb set; signal > 2 iff both bits set
      part_bit_a = in_msb;
      part_bit_b = in_msb*in_lsb;                          // AND(msb, lsb)
    }
    else if ((constant_msb == 1) && (constant_lsb == 1)) {
      // constant pair = 3: signal >= 3 iff both set; signal > 3 is impossible
      part_bit_a = in_msb*in_lsb;                          // AND(msb, lsb)
      part_bit_b = 0;
    }
    else assert(0 != 0); // impossible case

    // Combine into the weighted contribution for this pair:
    //   signal pair < constant pair  →  part_bit_a=0, part_bit_b=0  →  +a  (penalty)
    //   signal pair = constant pair  →  part_bit_a=1, part_bit_b=0  →   0  (neutral)
    //   signal pair > constant pair  →  part_bit_a=1, part_bit_b=1  →  +b  (reward)
    parts[i] <== (a * (1 - part_bit_a)) + (b * part_bit_b);

    // accumulate parts
    sum += parts[i];

    // Advance weights: a doubles, b shrinks by the same amount, preserving
    // the invariant that higher pairs dominate all lower ones.
    b -= bit_value;
    a += bit_value;
    bit_value <<= 1;
  }

  // The sum encodes the comparison result in bit 127:
  //   - If in > constant, wins dominate → sum >= 2^127, so bit 127 is set.
  //   - If in <= constant, losses dominate → sum < 2^127, so bit 127 is clear.
  //
  // 135 bits are needed because the maximum possible sum is:
  //   sum_max = Σ(i=0..126) b_i = Σ(i=0..126) (2^128 - 2^i)
  //           = 127·2^128 - (2^127 - 1)
  //           = 2^135 - 2^128 - 2^127 + 1
  // which fits in 135 bits but not 134.
  out_bits <== sum;
  component num2bits = Num2Bits(135);
  num2bits.in <== out_bits;
  out <== num2bits.out[127];
}

// Asserts that a 254-bit value is within the prime field.
//
// Inputs:
// - in: 254-bit binary representation of a number
template AliasCheck() {
  signal input in[254];

  component comparator = CompConstant(-1);
  for (var i = 0; i < 254; i++) {
    comparator.in[i] <== in[i];
  }

  comparator.out === 0;
}

// Returns the sign of a 254-bit value within the prime field.
// If a number is closer to zero than it is to the order of the field,
// it is defined to be positive; otherwise negative.
//
// Inputs:
// - in: 254-bit binary representation of a number
//
// Outputs:
// - out: 0 if positive, 1 if negative.
template Sign() {
  signal input in[254];
  signal output out;

  var half = 1 / 2;
  component comparator = CompConstant(half - 1);
  for (var i = 0; i < 254; i++) {
      comparator.in[i] <== in[i];
  }

  out <== comparator.out;
}

