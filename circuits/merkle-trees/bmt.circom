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

  // the path from the leaf (path[n]) up to the root (path[0]); a depth-n proof
  // performs n hash combines, so the path visits n+1 nodes.
  signal path[n + 1];

  // the deepest element in the path is the leaf hash
  path[n] <== Poseidon(1)([in]);

  // climb every level, combining the current node with its sibling
  signal children[n][2];
  for (var i = n; i != 0; i--) {
    // indices[i-1] is the position of the *current* node at this level:
    //   0 -> current is the right child (sibling on the left)
    //   1 -> current is the left  child (sibling on the right)
    // Switch swaps its inputs when the condition is 1, so feeding
    // [sibling, current] yields [sibling, current] for 0 and [current, sibling]
    // for 1 — i.e. the current node ends up on the correct side.
    children[i-1] <== Switch()(indices[i-1], [siblings[i-1], path[i]]);
    path[i-1] <== Poseidon(2)(children[i-1]);
  }

  // the top element in the path is the root hash
  root <== path[0];
}
