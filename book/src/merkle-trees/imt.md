# Incremental Merkle Tree

An **Incremental Merkle Tree** is a [Binary Merkle Tree](./bmt.md) of a fixed depth that starts out empty, and is filled with leaves one by one, from left to right. It is the data structure behind applications like [Tornado Cash](https://github.com/tornadocash/tornado-core), where each deposit adds a commitment to the tree, and [Semaphore](https://semaphore.pse.dev/), where each member of a group is a leaf. A user can then prove that their leaf is in the tree, without revealing which one it is.

Here we use [zk-kit](https://github.com/privacy-scaling-explorations/zk-kit.circom), a library by PSE that Semaphore is built on: its `BinaryMerkleRoot` circuit for membership proofs, and its [`IMT`](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/imt) TypeScript implementation to build the trees in our tests.

## Empty Subtrees

An empty leaf has some fixed value, which we call `ZERO`. Semaphore uses 0, while Tornado Cash uses `keccak256("tornado")` modulo $p$, which is unlikely to ever be an actual leaf.

Since every empty leaf has the same value, every empty subtree of the same height has the same root as well. These are called the _zeroes_ of the tree:

$$
z_0 = \texttt{ZERO} \qquad z_{i+1} = H(z_i, z_i)
$$

So the root of a completely empty tree of depth $d$ is simply $z_d$, and we never have to store the empty part of the tree.

## Inserting a Leaf

Leaves are always inserted at the next free position. This makes insertion very cheap: to insert a leaf at position $i$, we walk up from the leaf to the root, and at each level:

- if our node is a **left** child, its sibling on the right is still empty, so the sibling is the zero $z_\ell$ of that level,
- if our node is a **right** child, its sibling on the left is a subtree that is already full, and will never change again.

So we only need to remember the last full left subtree of each level, which Tornado Cash calls `filledSubtrees`. An insertion then takes only $d$ hashes and $O(d)$ storage, no matter how many leaves the tree has. That is why such trees are popular in smart contracts.

## Membership Proofs

```cs
template BinaryMerkleRoot(MAX_DEPTH) {
    signal input leaf, depth, index, siblings[MAX_DEPTH];

    signal output out;

    signal nodes[MAX_DEPTH + 1];
    nodes[0] <== leaf;

    signal roots[MAX_DEPTH];
    var root = 0;

    signal indices[MAX_DEPTH] <== Num2Bits(MAX_DEPTH)(index);
    
    for (var i = 0; i < MAX_DEPTH; i++) {
        var isDepth = IsEqual()([depth, i]);

        roots[i] <== isDepth * nodes[i];

        root += roots[i];

        var c[2][2] = [ [nodes[i], siblings[i]], [siblings[i], nodes[i]] ];
        var childNodes[2] = MultiMux1(2)(c, indices[i]);

        nodes[i + 1] <== Poseidon(2)(childNodes);
    }

    var isDepth = IsEqual()([depth, MAX_DEPTH]);

    out <== root + isDepth * nodes[MAX_DEPTH];
}
```

A membership proof works just like in a [Binary Merkle Tree](./bmt.md#binarymerkleproof), but zk-kit's circuit differs from ours in a few ways:

- The position of the leaf is given as a number `index`, and decomposed into bits with `Num2Bits`. This also guarantees that the indices are bits, which is [important](./bmt.md#the-indices-must-be-bits).
- The siblings are given from the bottom to the top, i.e. `siblings[0]` is the sibling of the leaf.
- Instead of `Switch`, it uses Circomlib's `MultiMux1` to order the two children.
- The depth of the tree is an input, and it can be anything up to `MAX_DEPTH`. At each level, the node is selected as the root if that level is the depth. This is useful for the [LeanIMT](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/lean-imt) of Semaphore v4, whose depth grows as leaves are added.
- The leaves are not hashed before going into the tree. In these applications, the leaves are already hashes, e.g. commitments.

> Since the leaves are not hashed and the depth is an input, the verifier must make sure that the depth is the actual depth of the tree. Otherwise, a prover could pick a smaller depth and present an internal node as a "leaf", which is the [second-preimage attack](./bmt.md#hashing-leaves--nodes-differently) we have seen before. Semaphore, for example, checks the depth in its smart contract.

## Insertion Proofs

```cs
{{#include ../../../circuits/merkle-trees/imt.circom:IncrementalMerkleTreeInsert}}
```

Insertion is usually done outside of a circuit, e.g. by a smart contract. However, sometimes we want to prove that an insertion was done correctly, e.g. when many insertions are batched together off-chain, and only a single proof is verified on-chain.

The trick is to notice that inserting a leaf does not change its siblings: the siblings are all in other parts of the tree. So the same path proves two things:

1. With the `ZERO` leaf, the path gives `oldRoot`. This proves that the position was empty before the insertion.
2. With the new `leaf`, the same path gives `newRoot`, which is the root after the insertion.

The circuit uses two `BinaryMerkleRoot`s for this, with `DEPTH` as the depth. It does not check that `index` is the _next_ free position, which is up to the caller, e.g. by making `index` a public input that is compared with the number of leaves. Also note that inserting `ZERO` itself would leave the tree unchanged, so `ZERO` should never be a real leaf.

Our tests use zk-kit's `IMT` to fill a tree of depth 4 from empty to full, proving every insertion along the way, and check that inserting into a position that is already filled, using a wrong old root, or using an index outside of the tree all fail.

## Constraint Count

Almost all of the cost comes from the Poseidon hashes, one per level. For a tree of depth 20, i.e. about a million leaves:

| Circuit                               | Constraints |
| ------------------------------------- | ----------- |
| `BinaryMerkleRoot(20)`                | 4923        |
| `IncrementalMerkleTreeInsert(20, 0)`  | 9720        |

The insertion proof costs about twice as much as a membership proof, since it computes two roots.

## See Also

- [PSE zk-kit: Incremental Merkle Tree](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/imt)
- [PSE zk-kit: Lean Incremental Merkle Tree](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/lean-imt)
- [HerodotusDev's Accumulators IMT](https://github.com/HerodotusDev/accumulators/blob/main/packages/incremental-merkle-tree/README.md)
- [RareSkills Tornado Cash Line-by-Line](https://www.rareskills.io/post/how-does-tornado-cash-work)
