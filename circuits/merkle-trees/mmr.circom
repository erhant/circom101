pragma circom 2.1.5;

// zk-kit's `BinaryMerkleRoot`, along with Circomlib's `Poseidon` and comparators
include "@zk-kit/binary-merkle-root.circom/src/binary-merkle-root.circom";
include "poseidon.circom";
include "comparators.circom";

// Merkle Mountain Range proof, computes the root from a leaf and its proof,
// in the same way as HerodotusDev's accumulators.
//
// Parameters:
// - B: number of bits of the leaf count, i.e. the MMR has less than 2^B leaves
//
// Inputs:
// - leaf: the leaf
// - index: index of the leaf, in range [0, leafCount)
// - leafCount: number of leaves in the MMR
// - siblings: siblings on the path from the leaf to the peak of its mountain,
//   i.e. `siblings[0]` is the sibling of the leaf, padded with 0
// - peaks: peaks of the mountains from the highest to the lowest, padded with 0
//
// Outputs:
// - root: the root of the MMR
// ANCHOR: MerkleMountainRangeProof
template MerkleMountainRangeProof(B) {
  assert(B > 1);
  signal input leaf;
  signal input index;
  signal input leafCount;
  signal input siblings[B - 1];
  signal input peaks[B];
  signal output root;

  // each set bit of `leafCount` is a mountain, with a height equal to the position of that bit
  signal n[B] <== Num2Bits(B)(leafCount);
  signal i[B] <== Num2Bits(B)(index);

  // the mountain of the leaf is at the highest bit where `leafCount` and `index` differ, and
  // `leafCount` must have a 1 there while `index` has a 0, which also means `index < leafCount`
  signal both[B];
  signal noneAbove[B + 1];
  signal isMountain[B];
  noneAbove[B] <== 1;
  for (var h = B - 1; h >= 0; h--) {
    both[h] <== n[h] * i[h];
    isMountain[h] <== (n[h] - both[h]) * noneAbove[h + 1];
    noneAbove[h] <== noneAbove[h + 1] * (1 - (n[h] + i[h] - 2 * both[h]));
  }
  var mountains = 0;
  for (var h = 0; h < B; h++) {
    mountains += isMountain[h];
  }
  mountains === 1;

  // height of the mountain, index of the leaf within the mountain (the lower bits of `index`),
  // and index of the peak of the mountain (the number of higher mountains)
  signal offsets[B];
  signal peakIndices[B];
  var height = 0;
  var offset = 0;
  var peakIndex = 0;
  for (var h = 0; h < B; h++) {
    var lower = 0;
    for (var k = 0; k < h; k++) {
      lower += i[k] * (1 << k);
    }
    var higher = 0;
    for (var k = h + 1; k < B; k++) {
      higher += n[k];
    }

    height += h * isMountain[h];
    offsets[h] <== isMountain[h] * lower;
    offset += offsets[h];
    peakIndices[h] <== isMountain[h] * higher;
    peakIndex += peakIndices[h];
  }

  // the root of the mountain must be its peak
  signal peak <== BinaryMerkleRoot(B - 1)(leaf, height, offset, siblings);
  signal selectedPeaks[B];
  var selected = 0;
  for (var j = 0; j < B; j++) {
    var isPeak = IsEqual()([peakIndex, j]);
    selectedPeaks[j] <== isPeak * peaks[j];
    selected += selectedPeaks[j];
  }
  selected === peak;

  // bag the peaks from right to left: `bag = H(peaks[0], H(peaks[1], ... H(peaks[k-2], peaks[k-1])))`
  var numPeaks = 0;
  for (var h = 0; h < B; h++) {
    numPeaks += n[h];
  }
  signal isLast[B];
  signal lastParts[B];
  signal hashes[B - 1];
  signal bags[B];
  var isInner = 0; // 1 if there is a peak to the right of `j`
  for (var j = B - 1; j >= 0; j--) {
    isLast[j] <== IsEqual()([numPeaks, j + 1]);
    lastParts[j] <== isLast[j] * peaks[j];
    if (j == B - 1) {
      bags[j] <== lastParts[j];
    } else {
      hashes[j] <== Poseidon(2)([peaks[j], bags[j + 1]]);
      bags[j] <== lastParts[j] + isInner * hashes[j];
    }
    isInner += isLast[j];
  }

  // the root commits to the number of elements (all nodes) as well
  var elementsCount = 2 * leafCount - numPeaks;
  root <== Poseidon(2)([elementsCount, bags[0]]);
}
// ANCHOR_END: MerkleMountainRangeProof
