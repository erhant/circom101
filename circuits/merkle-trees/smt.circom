pragma circom 2.1.0;

// We use Circomlib's sparse Merkle tree circuits as they are:
// - `SMTVerifier` for inclusion & exclusion proofs
// - `SMTProcessor` for insertions, updates & deletions
include "circomlib/circuits/smt/smtverifier.circom";
include "circomlib/circuits/smt/smtprocessor.circom";
