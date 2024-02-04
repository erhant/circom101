pragma circom 2.1.0;

include "../bits/index.circom";

// Compares a signal against a constant value.
// If `in` is greater than constant, returns 1.
//
// Inputs:
// - `in`: 254-bit binary representation of a number
//
// Outputs:
// - `out`: 1 if `in > constant`
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
    if ((constant_msb == 0) && (constant_lsb == 0)) {
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
    
    // log(constant_msb, constant_lsb, " | ", in_msb, in_lsb, " : ", part_bit_a, part_bit_b);

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
