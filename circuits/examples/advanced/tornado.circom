pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "@zk-kit/binary-merkle-root.circom/src/binary-merkle-root.circom";

// Computes the commitment of a deposit, and the hash of its nullifier.
//
// Inputs:
// - nullifier: a random secret, revealed as a hash when withdrawing
// - secret: a random secret, never revealed
//
// Outputs:
// - commitment: `Poseidon(nullifier, secret)`, the leaf added to the tree when depositing
// - nullifierHash: `Poseidon(nullifier)`, revealed when withdrawing
// ANCHOR: CommitmentHasher
template CommitmentHasher() {
  signal input nullifier;
  signal input secret;
  signal output commitment;
  signal output nullifierHash;

  commitment <== Poseidon(2)([nullifier, secret]);
  nullifierHash <== Poseidon(1)([nullifier]);
}
// ANCHOR_END: CommitmentHasher

// Proves the ownership of a deposit in a Tornado Cash-style mixer, without revealing which one.
// Based on: https://github.com/tornadocash/tornado-core/blob/master/circuits/withdraw.circom
//
// Parameters:
// - DEPTH: depth of the Merkle tree of deposits
//
// Inputs:
// - root: (public) root of the Merkle tree of deposits
// - nullifierHash: (public) hash of the nullifier, to prevent double withdrawals
// - recipient: (public) address that receives the funds
// - relayer: (public) address of the relayer that sends the transaction
// - fee: (public) fee paid to the relayer
// - nullifier: the nullifier of the deposit
// - secret: the secret of the deposit
// - index: position of the deposit in the tree
// - siblings: siblings on the path from the deposit to the root
// ANCHOR: Withdraw
template Withdraw(DEPTH) {
  signal input root;
  signal input nullifierHash;
  signal input recipient;
  signal input relayer;
  signal input fee;
  signal input nullifier;
  signal input secret;
  signal input index;
  signal input siblings[DEPTH];

  // the nullifier hash must belong to the deposit
  signal (commitment, computedNullifierHash) <== CommitmentHasher()(nullifier, secret);
  computedNullifierHash === nullifierHash;

  // the deposit must be in the tree
  signal computedRoot <== BinaryMerkleRoot(DEPTH)(commitment, DEPTH, index, siblings);
  computedRoot === root;

  // these are not used in any constraint, so we add dummy constraints to bind
  // them to the proof; otherwise, they could be changed without invalidating it
  signal recipientSquare <== recipient * recipient;
  signal relayerSquare <== relayer * relayer;
  signal feeSquare <== fee * fee;
}
// ANCHOR_END: Withdraw
