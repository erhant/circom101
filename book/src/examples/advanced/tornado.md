# Tornado Cash

[Tornado Cash](https://github.com/tornadocash/tornado-core) is a mixer on Ethereum, and one of the best-known applications of zero-knowledge proofs. Users deposit a fixed amount of tokens, and later withdraw them to a different address. Anyone can see the deposits and the withdrawals, but nobody can tell which deposit a withdrawal belongs to. This example puts together many of the pieces from this book: [commitments](../../hashing/#commitments), [incremental Merkle trees](../../merkle-trees/imt.md), and a new one, nullifiers.

## How It Works

1. **Deposit:** the user picks two random secrets, a `nullifier` and a `secret`, and sends the tokens along with a commitment $C = H(\textit{nullifier}, \textit{secret})$ to the contract. The contract inserts $C$ into an incremental Merkle tree. The secrets are kept by the user, and the commitment hides them.
2. **Withdraw:** later, the user proves in zero-knowledge that they know the secrets of _some_ commitment in the tree, without saying which one. Along with the proof, they reveal the nullifier hash $H(\textit{nullifier})$. The contract checks the proof, checks that the nullifier hash was not seen before, records it, and sends the tokens to the recipient.

The anonymity comes from the Merkle proof: it shows that the commitment is one of the leaves, and the more deposits there are, the larger the crowd to hide in.

## `CommitmentHasher`

```cs
{{#include ../../../../circuits/examples/advanced/tornado.circom:CommitmentHasher}}
```

> The original circuits use a Pedersen hash for the commitment and MiMCSponge for the Merkle tree. We use Poseidon for both, which is much cheaper; see [Hashing](../../hashing/) for a comparison.

## `Withdraw`

```cs
{{#include ../../../../circuits/examples/advanced/tornado.circom:Withdraw}}
```

The tree is a binary Merkle tree with Poseidon, so we use zk-kit's `BinaryMerkleRoot` as in the [Incremental Merkle Tree](../../merkle-trees/imt.md#membership-proofs) chapter, and test it against zk-kit's `IMT` in TypeScript.

## Nullifiers

Without nullifiers, the same deposit could be withdrawn again and again: the proof only shows that _a_ deposit exists, and since it does not reveal which one, the contract can not tell that it was already used.

The nullifier hash solves this. It is uniquely determined by the deposit, so withdrawing the same deposit twice reveals the same nullifier hash, and the contract rejects the second withdrawal. At the same time, it does not reveal which deposit it belongs to, since computing the commitment also requires the secret.

Why two secrets, and not just one? The commitment must not be computable from the nullifier hash, otherwise anyone could find the commitment in the tree, and link the withdrawal to its deposit. The `secret` is never revealed, so the commitment $H(\textit{nullifier}, \textit{secret})$ stays hidden, even after the nullifier hash is published.

Note that the nullifier hash depends only on the deposit, and not on its position in the tree. A prover might try to use a different `index` for the same deposit, but the Merkle proof fails for any position other than the real one, and even if a commitment was deposited twice, both would have the same nullifier hash and could be withdrawn only once.

## Binding the Public Inputs

The `recipient`, `relayer`, and `fee` are not needed to prove anything, so why are they inputs at all? Because the proof is public: it is sent in a transaction, and anyone watching the mempool can copy it. If the recipient was not part of the proof, an attacker could replace it with their own address, and steal the withdrawal.

So the recipient is a public input of the proof, and changing it should make the proof invalid. But the circuit does not use it anywhere, so the original circuit adds dummy constraints with squares, to make sure that these inputs are bound to the proof:

```cs
signal recipientSquare <== recipient * recipient;
```

The original code is honest about it: _"Most likely it is not required, but it's better to stay on the safe side and it only takes 2 constraints"_. Indeed, the Groth16 setup of snarkjs adds an extra constraint of the form `x * 0 = 0` for every public input `x`, which binds it to the proof even if the circuit never uses it. So with snarkjs, the squares are only a defense in depth; but other proof systems and tools may not do this, so it is a good habit to make sure that every public input appears in a constraint.

The `relayer` and `fee` exist because the user's new address has no ETH to pay for gas: a relayer sends the transaction on their behalf, and takes a fee from the withdrawn amount. Binding them prevents anyone from raising the fee.

## Trusting the Circuit

This circuit has a famous history. In 2019, a bug was found in the MiMC implementation of circomlib that Tornado Cash used: a single `=` instead of `<==` left an output of the hash [under-constrained](../../pitfalls.md#hints-are-not-constraints), so a prover could choose a fake root and withdraw tokens that were never deposited. The Tornado Cash team found it, [drained the vulnerable contract themselves](https://tornado-cash.medium.com/tornado-cash-got-hacked-by-us-b1e012a3c9a8), and moved the funds to a fixed one. It is a great reminder that one missing constraint is enough to break everything.

## Constraint Count

| Circuit              | non-linear constraints |
| -------------------- | ---------------------- |
| `CommitmentHasher()` | 453                    |
| `Withdraw(20)`       | 5316                   |

The commitment and the nullifier hash take 240 + 213 constraints for `Poseidon(2)` and `Poseidon(1)`. The Merkle proof takes most of the rest, about 243 per level, which is a `Poseidon(2)` and a few constraints to put the children in order. The three squares add 3. With a depth of 20, the tree has room for about a million deposits.

## See Also

- [Tornado Cash circuits](https://github.com/tornadocash/tornado-core/tree/master/circuits), the original implementation.
- [Proof of Innocence](https://github.com/chainwayxyz/proof-of-innocence) by Chainway, which lets a Tornado Cash user prove that their withdrawal does not come from a list of deposits of their choosing, e.g. those of a hack, without revealing which deposit it does come from.
- [Semaphore](https://semaphore.pse.dev/), which uses the same ideas (a Merkle tree of commitments and nullifiers) for anonymous signaling, e.g. voting.
