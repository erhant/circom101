# Common Pitfalls

A circuit can compute the right answer for every honest input, and still be broken: what matters is what a **dishonest** prover can get away with. Most bugs in Circom circuits are _under-constrained_ circuits, where some signal is not fully determined by the constraints, so a prover can pick a value of their liking and still create a valid proof.

The pitfalls below come up again and again throughout this book. Each of them links to the chapter where it appears.

## Hints Are Not Constraints

The `<--` operator assigns a value to a signal without adding any constraint, and so does an `assert` on a signal: they only run while computing the witness. A dishonest prover does not have to run them at all, and can put any value into such a signal.

So every signal assigned with `<--` must be fully pinned down by `===` constraints afterwards.

- [Integer Division](./arithmetic/int-div.md) computes the quotient and the remainder with `<--`, and checking only `in[0] === quot * in[1] + rem` and `rem < in[1]` is not enough: a "negative" remainder still passes, unless both the quotient and the remainder are range-checked.
- [Inversion](./arithmetic/inverse.md) has an `assert(in != 0)`, which does not prevent a witness with `in = 0`, so the circuit must handle that case with constraints.

## Booleans Must Be Constrained to Be Bits

Many circuits assume that some signal is a bit, e.g. the condition of [`IfElse` & `Switch`](./control-flow/), the selectors of a [multiplexer](./control-flow/multiplexing.md), or the inputs of the [logic gates](./bits/logic-gates.md). If it is not constrained to be 0 or 1, the output becomes a mix of both options.

In a [Binary Merkle Tree](./merkle-trees/bmt.md#the-indices-must-be-bits), an index that is not a bit lets a prover choose the two children of a node freely, and prove that a leaf is in the tree although it is not! Use `AssertBit`, or obtain the bits from `Num2Bits`.

## Comparisons Need Range Checks

[`LessThan(n)`](./comparators/#lessthan) is only correct when both inputs are `n`-bit numbers, and it does not check this itself. For larger inputs, it silently returns a wrong result: e.g. it says that $-1 < 0$, where $-1$ is actually the largest field element.

So always range-check the inputs of a comparison, unless they are already known to be small. Forgetting this broke [Integer Division](./arithmetic/int-div.md), and would break the indices of [Two Sum](./examples/intermediate/two-sum.md#indices-within-the-array).

## There Are No Negative Numbers

Every signal is a field element modulo a prime $p$, so $-1$ is $p - 1$, and arithmetic wraps around at $p$. This is easy to forget:

- A "negative" value passes a check like `x < y` if the inputs are not [range-checked](#comparisons-need-range-checks).
- An equation like `a === q * b + r` holds modulo $p$; it only holds over the integers if the values are small enough to not wrap around, which is why [Integer Division](./arithmetic/int-div.md) limits its number of bits.
- At compile time, Circom compares field elements as _signed_ numbers, so `-1 < 0` is true there; see [`nbits`](./bits/#function-nbits).

## Bit Decompositions Can Have Aliases

A field element of BN254 fits in 254 bits, but 254 bits can represent numbers larger than $p$. So some values have two different 254-bit representations, $x$ and $x + p$. If a circuit decomposes a value into 254 bits, it must also check that the bits represent a number less than $p$, using an [alias check](./comparators/constant.md#aliascheck). The [Sparse Merkle Tree](./merkle-trees/smt.md#checking-the-keys) does this for its keys, otherwise a key could take two different paths in the tree.

## Out-of-Bounds Accesses Do Not Fail

[`ArrayRead`](./arrays/#arrayread) returns 0 for an index outside of the array, instead of failing. If the index comes from the prover, it must be range-checked; otherwise reading a 0 may be enough to cheat, as in [Two Sum](./examples/intermediate/two-sum.md#indices-within-the-array).

## Check the Inputs, Not Just the Computation

A circuit proves a statement about its inputs, and the inputs are chosen by the prover. If the statement only makes sense for "valid" inputs, the circuit must check that they are valid:

- A [Magic Square](./examples/simple/magic.md#using-each-number-once) circuit that only checks the sums accepts a grid of all 5s.
- The famous formula of [Missing Number](./examples/simple/missing-number.md#the-catch) returns a meaningless answer for repeated or out-of-range numbers.
- [Sudoku](./examples/intermediate/sudoku.md#why-this-is-enough) needs both the range checks and the distinctness checks, as neither is enough on its own.

## Bind Every Public Input

A public input that does not appear in any constraint may not be bound to the proof, so the same proof could be valid for another value of it. [Tornado Cash](./examples/advanced/tornado.md#binding-the-public-inputs) squares its recipient for this reason, so that nobody can copy a proof from the mempool and change the recipient to themselves.

## Hash Different Things Differently

When the same hash function is used for different kinds of data, a value of one kind may be passed off as another. In a Merkle tree, an internal node could be presented as a leaf, which is the [second-preimage attack](./merkle-trees/bmt.md#hashing-leaves--nodes-differently). Hash leaves and nodes differently, and if the depth of a tree is an input, make sure that it is the actual depth, as in the [Incremental Merkle Tree](./merkle-trees/imt.md#membership-proofs).

## Test the Failures

Tests that only check valid inputs can not find any of the bugs above. For every circuit, also test that invalid inputs are **rejected**: out-of-range values, non-bits, wrong orders, and so on. With [Circomkit](https://github.com/erhant/circomkit), `expectFail` checks that an input is rejected, and `editWitness` & `expectConstraintFail` let you hand-craft the witness of a dishonest prover, including the values assigned with `<--`. For example, the test of [Integer Division](./arithmetic/int-div.md) forges a witness with a wrong quotient, and checks that the constraints reject it.

Logic errors are worth testing for as well: [`IsSorted`](./arrays/sorted.md) once returned 1 if _any_ pair was ordered, and a test with a fully reversed array could not notice it, while a test with a single pair out of order could.
