pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

// Binary Merkle Tree
//
// Parameters:
// - n: depth of the tree such that number of leaves is 2^n
//
// Inputs:
// - leafs: the leaves of the tree
//
// Outputs:
// - root: the root of the tree
//
template BinaryMerkleTree(n) {
  assert(n > 0);
  var NUM_LEAVES = 1 << n;
  var NUM_NODES = (1 << (n+1)) - 1;
  signal input leafs[NUM_LEAVES];
  signal output root;

  signal nodes[NUM_NODES];

  // compute hashes of leaves
  for (var i = 0; i < NUM_LEAVES; i++) {
    nodes[(NUM_NODES - 1) - i] <== Poseidon(1)([leafs[i]]);
  }
  
  // build the tree from the leaves to the root in reverse
  for (var i = NUM_NODES - NUM_LEAVES - 1; i >= 0; i--) {
    nodes[i] <== Poseidon(2)([nodes[2*i + 1], nodes[2*i + 2]]);
  }

  root <== nodes[0];
}
