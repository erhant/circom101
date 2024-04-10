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

  // TODO: what is a and b?
  var a = 1;
  var b = (1 << (128)) - 1;

  var sum = 0;
  var bit_value = 1;

  signal parts[127];
  signal out_bits;
  for (var i = 0; i < 127; i++) {
    // constant LSB and MSB
    var constant_lsb = (constant >> (i*2)) & 1;
    var constant_msb = (constant >> (i*2 + 1)) & 1;

    // input LSB and MSB
    var in_lsb = in[i*2];
    var in_msb = in[i*2 + 1];

    var part_bit_a;
    var part_bit_b;
    /**/ if ((constant_msb == 0) && (constant_lsb == 0)) {
      part_bit_a = 1;
      part_bit_b = in_msb + in_lsb - in_msb*in_lsb;
    } 
    else if ((constant_msb == 0) && (constant_lsb == 1)) {
      part_bit_a = in_msb + in_lsb - in_msb*in_lsb;
      part_bit_b = in_msb;
    } 
    else if ((constant_msb == 1) && (constant_lsb == 0)) {
      part_bit_a = in_msb;
      part_bit_b = in_msb*in_lsb;
    } 
    else if ((constant_msb == 1) && (constant_lsb == 1)) {
      part_bit_a = in_msb*in_lsb;
      part_bit_b = 0;
    }
    else assert(0 != 0); // impossible case

    parts[i] <== (a * (1 - part_bit_a)) + (b * part_bit_b);

    // accumulate parts
    sum += parts[i];

    // go to next bit
    b -= bit_value;
    a += bit_value;
    bit_value <<= 1;
  }

  out_bits <== sum;
  component num2bits = Num2Bits(135); // TODO: why 135?
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

