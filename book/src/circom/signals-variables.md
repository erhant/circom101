# Numbers

So, we have quickly went over what a finite field is, and we have said that Circom circuits operate on these numbers. But wait, does that mean we only have access to numbers and no other types such as string, char or boolean? Well, you are right… Fret not, everything can be represented by a number to some extent :)

Other than sticking to numbers alone, Circom brings the trouble of writing constraints on these numbers. Constraints are what makes zero-knowledge proofs possible. In particular, they assure "verifiable computation"; a verifier can be sure with overwhelming probability that a trustless party has computed something using this given circuit.

You can think of writing Circom as writing two programs at the same time: one for the honest prover and the other for the verifier.

- The "prover code" handles witness calculation using signals and variables.
- The "verifier code" handles proof verification by adding constraints on signals.

The "prover code" is rather free in what it can do with numbers. Circom provides quite a lot of operations such as modulo, division, bitwise shifts, and much more. However, the "verifier code" is not that free. To understand why, we need to learn about signals and variables.

### Signals & Variables

We have said that Circom circuits operate on elements of finite field. Those are our signals, and they are immutable (once you assign them, you can't change them).

Imagine the following, you have a digital circuit with some logic gates in it, many many wires between those gates where the output of some gate is input to one another. The user input itself is also wired to some gates, and the final output itself is the wire from the last gate.

**Variables** on the other hand, are there to make programming a bit easier for us. They are **mutable**, and they can hold not only numerical values but also arithmetical expressions.

As a prover, we care about both of them, but the verifier will only work on signals during the verification. As such, it will be important to use signals in a "sound" way, so that there is no room left for an adversary prover to exploit them and fool the verifier.
