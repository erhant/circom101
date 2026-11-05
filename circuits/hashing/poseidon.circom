pragma circom 2.1.0;

// round constants `POSEIDON_C(t)` and MDS matrices `POSEIDON_M(t)` from Circomlib,
// in the form used by the original (non-optimized) Poseidon permutation
include "circomlib/circuits/poseidon_constants_old.circom";

// The S-box of Poseidon, `x^5`.
//
// Inputs:
// - in: a field element
//
// Outputs:
// - out: `in^5`
// ANCHOR: SBox
template SBox() {
  signal input in;
  signal output out;

  signal in2 <== in * in;
  signal in4 <== in2 * in2;
  out <== in4 * in;
}
// ANCHOR_END: SBox

// Poseidon hash, written as the plain permutation from the paper.
// It computes the same hash as Circomlib's `Poseidon`.
//
// Parameters:
// - n: number of inputs, at most 16
//
// Inputs:
// - in: `n` field elements
//
// Outputs:
// - out: the hash of `in`
// ANCHOR: PoseidonHash
template PoseidonHash(n) {
  assert(1 <= n && n <= 16);
  signal input in[n];
  signal output out;

  // the state has one more element than the inputs, called the "capacity"
  var t = n + 1;

  // number of full rounds and partial rounds, from the Poseidon paper
  var R_F = 8;
  var N_ROUNDS_P[16] = [56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68];
  var R_P = N_ROUNDS_P[t - 2];

  var C[t * (R_F + R_P)] = POSEIDON_C(t);
  var M[t][t] = POSEIDON_M(t);

  // the initial state is `[0, in[0], ..., in[n-1]]`
  var state[t];
  state[0] = 0;
  for (var i = 0; i < n; i++) {
    state[i + 1] = in[i];
  }

  for (var r = 0; r < R_F + R_P; r++) {
    // 1. add round constants
    for (var i = 0; i < t; i++) {
      state[i] += C[r * t + i];
    }

    // 2. apply the S-box: to all elements in a full round, and only to the
    // first element in a partial round; the full rounds are the first and
    // last `R_F / 2` rounds, and the partial rounds are in between
    var isFull = (r < R_F / 2) || (r >= R_F / 2 + R_P);
    for (var i = 0; i < t; i++) {
      if (i == 0 || isFull) {
        state[i] = SBox()(state[i]);
      }
    }

    // 3. mix the state by multiplying it with the MDS matrix
    var mixed[t];
    for (var i = 0; i < t; i++) {
      mixed[i] = 0;
      for (var j = 0; j < t; j++) {
        mixed[i] += M[i][j] * state[j];
      }
    }
    state = mixed;
  }

  out <== state[0];
}
// ANCHOR_END: PoseidonHash
