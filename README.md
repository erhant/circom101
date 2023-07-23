# Circom by Examples

> Deep dive into Circom circuits.

We make heavy use of [Circomlib](./node_modules/circomlib/circuits).

1. Multiplier, Fibonacci.
1. Logical Gates, Comparators, IsZero.
1. Sudoku
1. If-Else, Switcher, Multiplexing
1. Hash Functions: Poseidon, MIMC and SHA256.
1. Merkle Trees. (Incremential, Sparse, Naive)
1. Arrays, Sorting

We use `mdbook` to create the book, see the [book](./book/) folder.

For each circuit, we dive deep into the constraints and tests them out.

TIPS:

- if expensive: compute outside, verify inside
- disable checks if enabled trick
