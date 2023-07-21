# Circom: Circuit Compiler

Circom is a hardware description language (HDL) specifically designed for creating zero-knowledge proofs. It enables developers to create arithmetic circuits, which are then used to generate proofs that demonstrate a certain statement is true, without revealing any additional information about the inputs used to make that statement. Circom has opened up new possibilities for creating privacy-preserving applications, such as digital identities, voting systems, and financial transactions, where proving the validity of a statement is necessary, but keeping the underlying data private is critical.

A "Circuit" is literally what you think, a literal circuit:

- Electronic circuits operate on electricity and electronic gates.
- Digital circuits operate on 0s and 1s and logic gates.
- Arithmetic circuits operate on integers and arithmetic gates.

By integers, we specifically mean "elements of a finite field". This requires a special section on its own, so let's quickly go over it to know what exactly our circuits operate on.
