pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";
include "../control-flow/index.circom";

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
    nodes[(NUM_NODES - 1) - i] <== Poseidon(1)([leafs[(NUM_LEAVES - 1) - i]]);
  }
  
  // build the tree from the leaves to the root in reverse
  for (var i = NUM_NODES - NUM_LEAVES - 1; i >= 0; i--) {
    nodes[i] <== Poseidon(2)([nodes[2*i + 1], nodes[2*i + 2]]);
  }

  root <== nodes[0];
}

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
template BinaryMerkleProof(n) {
  assert(n > 0);
  signal input in;
  signal input siblings[n];
  signal input indices[n];
  signal output root;

  // the path from the leaf to the root
  signal path[n];

  // the last element in the path is the leaf hash
  path[n-1] <== Poseidon(1)([in]);
  
  // compute the "audit path" w.r.t indices
  signal children[n-1][2];
  for (var i = n-1; i != 0; i--) {
    // index 0: sibling is on the right
    // index 1: sibling is on the left
    children[i-1] <== Switch()(indices[i], [path[i], siblings[i]]);
    path[i-1] <== Poseidon(2)(children[i-1]);
  }

  // the last element in the path is the root hash
  root <== path[0];
}
