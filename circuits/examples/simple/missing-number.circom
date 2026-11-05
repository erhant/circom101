pragma circom 2.1.0;

include "../../arrays/distinct.circom";
include "../../comparators/range.circom";

// LeetCode 268: Missing Number
//
// Given `n` distinct numbers in range [0, n], returns the only number in that range
// that is missing from the array.
//
// Parameters:
// - n: length of `nums`
//
// Inputs:
// - nums: an array of `n` distinct numbers in range [0, n]
//
// Outputs:
// - out: the missing number
template MissingNumber(n) {
  signal input nums[n];
  signal output out;

  // without these checks, `out` would be meaningless for an invalid `nums`
  for (var i = 0; i < n; i++) {
    AssertInRange(0, n)(nums[i]);
  }
  AssertDistinct(n)(nums);

  // the missing number is the sum of 0, 1, ..., n minus the sum of `nums`
  var sum = 0;
  for (var i = 0; i < n; i++) {
    sum += nums[i];
  }
  out <== n * (n + 1) \ 2 - sum;
}
