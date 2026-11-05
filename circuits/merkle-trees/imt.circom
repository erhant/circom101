pragma circom 2.1.5;

// zk-kit's `BinaryMerkleRoot`, which computes the root from a leaf and its Merkle proof
include "@zk-kit/binary-merkle-root.circom/src/binary-merkle-root.circom";

// Proves that inserting `leaf` at position `index` of an incremental Merkle tree
// with root `oldRoot` results in a tree with root `newRoot`.
//
// Parameters:
// - DEPTH: depth of the tree, such that it has 2^DEPTH leaves
// - ZERO: value of an empty leaf
//
// Inputs:
// - oldRoot: root of the tree before the insertion
// - leaf: the new leaf
// - index: position of the new leaf
// - siblings: siblings on the path from the leaf to the root, i.e.
//   `siblings[0]` is the sibling of the leaf
//
// Outputs:
// - newRoot: root of the tree after the insertion
// ANCHOR: IncrementalMerkleTreeInsert
template IncrementalMerkleTreeInsert(DEPTH, ZERO) {
  signal input oldRoot;
  signal input leaf;
  signal input index;
  signal input siblings[DEPTH];
  signal output newRoot;

  // the position must be empty in the old tree
  signal emptyRoot <== BinaryMerkleRoot(DEPTH)(ZERO, DEPTH, index, siblings);
  emptyRoot === oldRoot;

  // the same path with the new leaf gives the new root
  newRoot <== BinaryMerkleRoot(DEPTH)(leaf, DEPTH, index, siblings);
}
// ANCHOR_END: IncrementalMerkleTreeInsert
