# About this Book

Zero-knowledge cryptography is a fascinating area, where a party can prove a statement without revealing any extra information about it; proving that something is true without revealing what makes that "something" true.

Circom is a hardware description language (HDL) specifically designed for creating zero-knowledge proofs. It enables developers to create arithmetic circuits, which are then used to generate proofs that demonstrate a certain statement is true, without revealing any additional information about the inputs used to make that statement.

Circom has opened up new possibilities for creating privacy-preserving applications, such as digital identities, voting systems, and financial transactions, where proving the validity of a statement is necessary, but keeping the underlying data private is critical.

On the other hand, zero-knowledge proofs can serve as proofs of honest computation, without necessarily hiding the data underneath. This paves the way on new methods of off-loaded computation, most notable example being the zk-rollup ecosystem.

## Organization

The book is organized as follows:

- [Arithmetic](./arithmetic/) starts with a quick look at finite fields, i.e. what the numbers in a circuit actually are, and then has several hello-world level Circom programs such as addition & multiplication, to get the reader started, followed by inversion & integer division. It is strongly recommended to understand how the programs here work.
- [Bits](./bits/) describes methods related to bits, which are signals with value 0 or 1; you can think of them as booleans as well.
- [Comparators](./comparators/) describes comparators such as equality, less-than, greater-than-or-equal and such. It also describes some more specialized methods like alias-check and sign-check.
- [Control-Flow](./control-flow/) describes how if-else works in the circuit world.
- [Arrays](./arrays/) describes array methods.
- [Hashing](./hashing/) describes circuit-friendly hashes, such as Poseidon and MiMC, and how to build commitments with them.
- [Merkle Trees](./merkle-trees/) describes Merkle Trees and their usage in Circom circuits, from binary Merkle trees to sparse Merkle trees and Merkle mountain ranges.
- [Common Pitfalls](./pitfalls.md) collects the mistakes that come up again and again in Circom circuits, and how to avoid them.
- [Further Topics](./advanced/) covers topics beyond writing circuits, such as alternative provers, large circuits and folding.
- [Examples](./examples/simple/) puts everything together in complete circuits, from simple ones like Fibonacci & Magic Squares, to puzzles like Sudoku & N-Queens, some well-known LeetCode problems, and a ZK puzzle from Axiom.

## Counting Constraints

Throughout the book, we measure the cost of a circuit by its number of **non-linear constraints**, as reported by the Circom compiler with full simplification:

```sh
circom circuit.circom --r1cs --O2
```

Only multiplications of signals create non-linear constraints. Additions and multiplications by constants only create linear constraints, which are free: with `--O2` the compiler eliminates them entirely, by expressing some signals in terms of others. For example, the [Fibonacci](./examples/simple/fibonacci.md) circuit only has additions, so it has no non-linear constraints at all!

## Follow Along

You can clone the [repository](https://github.com/erhant/circom101) and examine the circuits yourself, we provide documentation within the code as well. We also provide tests via [Circomkit](https://github.com/erhant/circomkit) that demonstrate each circuit described here. In the repository, you can run the command below to run all tests:

```sh
bun test
```

Alternatively, you can play around with the circuits without ever leaving your browser, just visit [zkrepl.dev](https://zkrepl.dev/)!

## Resources

There are many resources about Circom & ZK out there, to list a few:

- [Official Circom Docs](https://docs.circom.io/) by [@iden3](https://twitter.com/identhree).
- [Circomlib](https://github.com/iden3/circomlib/) is a collection of common circuits, by [@iden3](https://twitter.com/identhree).
- [Circom Tutorial](https://www.rareskills.io/post/circom-tutorial) by [RareSkills](https://twitter.com/RareSkills_io).
- [zkJargon Decoder](https://nmohnblatt.github.io/zk-jargon-decoder/foreword.html) by [@nico_mnbl](https://twitter.com/nico_mnbl).
- [BattleZips](https://battlezips.gitbook.io/battlezips/) by [BattleZips](https://github.com/BattleZips)
- [0xPARC Learning Group 1](https://learn.0xparc.org/materials/circom/prereq-materials/intro) by [0xPARC](https://0xparc.org/)
- [Circom & Noir](https://hackmd.io/@doulos819/circom-and-noir) by [@doulos819](https://hackmd.io/@doulos819)
