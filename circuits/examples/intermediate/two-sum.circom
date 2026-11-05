pragma circom 2.1.0;

include "../../arrays/index.circom";
include "../../comparators/index.circom";
include "../../comparators/range.circom";

// LeetCode 1: Two Sum
//
// Asserts that `nums[i] + nums[j] = target` for two different indices `i` and `j`.
// The indices are found outside the circuit, and the circuit only verifies them.
//
// Parameters:
// - n: length of `nums`
//
// Inputs:
// - nums: an array of `n` numbers
// - target: the target sum
// - i: index of the first number
// - j: index of the second number, such that `i < j`
// ANCHOR: TwoSum
template TwoSum(n) {
  signal input nums[n];
  signal input target;
  signal input i;
  signal input j;

  // indices must be within the array, as `ArrayRead` returns 0 otherwise
  AssertInRange(0, n - 1)(i);
  AssertInRange(0, n - 1)(j);

  // indices must be different; we require `i < j` so that each pair is given in one order only
  signal isLess <== LessThan(nbits(n - 1))([i, j]);
  isLess === 1;

  // the numbers at these indices must sum up to the target
  signal a <== ArrayRead(n)(nums, i);
  signal b <== ArrayRead(n)(nums, j);
  a + b === target;
}
// ANCHOR_END: TwoSum
