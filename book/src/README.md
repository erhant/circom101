# About this Book

Zero-knowledge cryptography is a fascinating area, where a party can prove a statement without revealing any extra information about it; proving that something is true without revealing what makes that "something" true.

Circom is a hardware description language (HDL) specifically designed for creating zero-knowledge proofs. It enables developers to create arithmetic circuits, which are then used to generate proofs that demonstrate a certain statement is true, without revealing any additional information about the inputs used to make that statement.

Circom has opened up new possibilities for creating privacy-preserving applications, such as digital identities, voting systems, and financial transactions, where proving the validity of a statement is necessary, but keeping the underlying data private is critical.

On the other hand, zero-knowledge proofs can serve as proofs of honest computation, without necessarily hiding the data underneath. This paves the way on new methods of off-loaded computation, most notable example being the zk-rollup ecosystem.

## Organization

The book is organized as follows:

- [Preliminary](./preliminary/) has some preliminary theory for those who are interested in it. It is not 100% required to know the theory & math behind the relevant cryptography areas to write good Circom code; however, it could allow the reader to:
  - Write more efficient code by utilizing mathematical tricks.
  - Understand certain low-level code.
  - Consider more edge cases & write more secure code.
- [Basics](./basics/) has several hello-world level Circom programs, to get the reader started. The reader is free to skip this part & come back later, however it is strongly recommended to understand how the programs here work.
- [Bits](./bits/) describe methods related to bits, which are signals with value 0 or 1; you can think of them as booleans as well.
- [Comparators](./comparators/) describe comparators such as equality, less-than, greater-than-or-equal and such. It also describes some more specialized methods like alias-check and sign-check.
- [Control-Flow](./control-flow/) describes how if-else works in the circuit world.
- [Arrays](./arrays/) describe array methods.
- [Hashing](./hashing/) describe circuit-friendly hashes, such as Poseidon and MiMC.
- [Merkle Trees](./merkle-trees/) describe Merkle Trees and their usage in Circom circuits.
- [Advanced](./advanced/) section has some advanced concepts such as alternative provers, or large circuits.

## Follow Along

You can clone the [repository](https://github.com/erhant/circom101) and examine the circuits yourself, we provide documentation within the code as well. We also provide tests via [Circomkit](https://github.com/erhant/circomkit) that demonstrate each circuit described here. In the repository, you can run the command below to run all tests:

```sh
yarn test
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
