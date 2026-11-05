pragma circom 2.1.0;

include "../../comparators/index.circom";

// Filters an array of tuples by their first entry, keeping the original order.
// See: https://hackmd.io/@axiom/rkIujYOt2
//
// The matching tuples are moved to the front with a log-shifter: each matching tuple
// must move left by the number of non-matching tuples before it, and at stage `b` it
// moves by `2^b` if bit `b` of that shift is set.
//
// Parameters:
// - n: number of tuples
//
// Inputs:
// - in: an array of `n` tuples
// - match: value to compare against the first entry of each tuple
//
// Outputs:
// - num_match: number of tuples whose first entry is `match`
// - out: the matching tuples in their original order, followed by 0-padding
template Filter(n) {
  signal input in[n][2];
  signal input match;
  signal output num_match;
  signal output out[n][2];

  // number of bits needed for a shift, which is at most n-1
  var B = nbits(n - 1);

  // find the matching tuples
  signal isMatch[n];
  for (var i = 0; i < n; i++) {
    isMatch[i] <== IsEqual()([in[i][0], match]);
  }

  // `val[j]` and `bits[j]` hold the second entry & shift bits of the tuple in slot `j`;
  // non-matching tuples are zeroed out, so moving them around has no effect
  var val[n];
  var bits[n][B];
  signal values[n];
  signal shifts[n];
  component shiftBits[n-1]; // the first tuple never moves
  var count = 0;
  for (var i = 0; i < n; i++) {
    // the shift is the number of non-matching tuples before this one
    values[i] <== isMatch[i] * in[i][1];
    shifts[i] <== isMatch[i] * (i - count);
    count += isMatch[i];

    val[i] = values[i];

    // a tuple can not move further left than the first slot, so the shift
    // of the i'th tuple is at most `i`, and fits in `nbits(i)` bits
    var b_i = nbits(i);
    if (i > 0) {
      shiftBits[i-1] = Num2Bits(b_i);
      shiftBits[i-1].in <== shifts[i];
    }
    for (var k = 0; k < B; k++) {
      bits[i][k] = k < b_i ? shiftBits[i-1].out[k] : 0;
    }
  }
  num_match <== count;

  // at stage `b`, a tuple whose shift has bit `b` set moves left by `2^b`;
  // it carries its value along with the remaining bits `b+1, b+2, ...` of its shift
  //
  // as above, the remaining shift of a tuple in slot `j` is at most `j`, so its
  // bit `k` can only be set if `j >= 2^k`; we skip the products that are always 0
  signal movedVal[B][n];
  signal movedBits[B][n][B];
  for (var b = 0; b < B; b++) {
    var d = 1 << b;

    // what leaves each slot, i.e. the tuple if it moves and 0 otherwise
    for (var j = 0; j < n; j++) {
      if (j >= d) {
        movedVal[b][j] <== bits[j][b] * val[j];
      } else {
        // can not move further left, its shift is guaranteed to be smaller than `d`
        movedVal[b][j] <== 0;
      }

      for (var k = 0; k < B; k++) {
        if (k > b && j >= (1 << k)) {
          movedBits[b][j][k] <== bits[j][b] * bits[j][k];
        } else {
          movedBits[b][j][k] <== 0;
        }
      }
    }

    // each slot keeps what has not left, and receives what leaves from `d` slots to the right
    for (var j = 0; j < n; j++) {
      val[j] = val[j] - movedVal[b][j];
      if (j + d < n) {
        val[j] += movedVal[b][j + d];
      }

      for (var k = b + 1; k < B; k++) {
        bits[j][k] = bits[j][k] - movedBits[b][j][k];
        if (j + d < n) {
          bits[j][k] += movedBits[b][j + d][k];
        }
      }
    }
  }

  // the first entry of a matching tuple is `match` itself, so we only need to know
  // which slots are filled, i.e. the first `num_match` slots: `isFilled = [1, ..., 1, 0, ..., 0]`
  signal isFilled[n];
  for (var j = 0; j < n; j++) {
    isFilled[j] <-- j < count ? 1 : 0;
  }
  // the first one is a bit, and each next one is either 0 or the same as the previous one,
  // so all of them are bits and once a 0 is seen the rest are 0 as well
  isFilled[0] * (isFilled[0] - 1) === 0;
  for (var j = 1; j < n; j++) {
    isFilled[j] * (isFilled[j - 1] - isFilled[j]) === 0;
  }
  var filled = 0;
  for (var j = 0; j < n; j++) {
    filled += isFilled[j];
  }
  filled === num_match;

  for (var j = 0; j < n; j++) {
    out[j][0] <== match * isFilled[j];
    out[j][1] <== val[j];
  }
}
