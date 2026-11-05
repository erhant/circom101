pragma circom 2.1.5;

// zk-kit's `BinaryMerkleRoot`, along with Circomlib's `Poseidon` and comparators
include "@zk-kit/binary-merkle-root.circom/src/binary-merkle-root.circom";
include "poseidon.circom";
include "comparators.circom";

// Returns the deepest level of a complete binary tree with `N` leaves, i.e. `floor(log2(2N - 1))`.
// ANCHOR: cbmtDepth
function cbmtDepth(N) {
  var depth = 0;
  while ((1 << (depth + 1)) <= 2 * N - 1) {
    depth++;
  }
  return depth;
}
// ANCHOR_END: cbmtDepth

// Complete Binary Merkle Tree, computes the root from all leaves.
//
// Parameters:
// - N: number of leaves
//
// Inputs:
// - leafs: the leaves of the tree
//
// Outputs:
// - root: the root of the tree
// ANCHOR: CompleteBinaryMerkleTree
template CompleteBinaryMerkleTree(N) {
  assert(N > 0);
  signal input leafs[N];
  signal output root;

  // nodes are stored as in a binary heap: the root is at 0,
  // the children of node `i` are `2i + 1` and `2i + 2`, and the leaves are the last `N` nodes
  signal nodes[2 * N - 1];
  for (var i = 0; i < N; i++) {
    nodes[N - 1 + i] <== Poseidon(1)([leafs[i]]);
  }
  for (var i = N - 2; i >= 0; i--) {
    nodes[i] <== Poseidon(2)([nodes[2 * i + 1], nodes[2 * i + 2]]);
  }

  root <== nodes[0];
}
// ANCHOR_END: CompleteBinaryMerkleTree

// Complete Binary Merkle Proof, computes the root from a leaf and its path.
//
// Parameters:
// - N: number of leaves
//
// Inputs:
// - leaf: the leaf
// - index: index of the leaf, in range [0, N)
// - siblings: siblings on the path from the leaf to the root, i.e. `siblings[0]` is the
//   sibling of the leaf; padded with 0 if the leaf is not at the deepest level
//
// Outputs:
// - root: the root of the tree
// ANCHOR: CompleteBinaryMerkleProof
template CompleteBinaryMerkleProof(N) {
  assert(N > 1);
  var D = cbmtDepth(N);
  signal input leaf;
  signal input index;
  signal input siblings[D];
  signal output root;

  // the index must be within the leaves; `N <= 2^D`, so both fit in `D + 1` bits
  _ <== Num2Bits(D + 1)(index);
  signal isValid <== LessThan(D + 1)([index, N]);
  isValid === 1;

  // position of the leaf in the tree, counting from 1 at the root, level by level;
  // the leaf is at the deepest level `D` if its position is at least `2^D`, otherwise at `D - 1`
  var position = N + index;
  signal isShallow <== LessThan(D + 1)([position, 1 << D]);
  var depth = D - isShallow;

  // the index of the leaf within its level, whose bits give the path from the leaf to the root
  var levelIndex = position - (1 << D) + isShallow * (1 << (D - 1));

  signal leafHash <== Poseidon(1)([leaf]);
  root <== BinaryMerkleRoot(D)(leafHash, depth, levelIndex, siblings);
}
// ANCHOR_END: CompleteBinaryMerkleProof
