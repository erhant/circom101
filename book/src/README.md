# Circom 101

Zero-knowledge proofs are a fascinating area of cryptography that allows parties to prove a statement without revealing any extra information about it; just proving that statement alone. In other words, zero-knowledge proofs can demonstrate that something is true, without revealing what makes that "something" true. There are great resources online to learn more about them, to name a few:

- todo
- todo
- todo

Circom is a hardware description language (HDL) specifically designed for creating zero-knowledge proofs. It enables developers to create arithmetic circuits, which are then used to generate proofs that demonstrate a certain statement is true, without revealing any additional information about the inputs used to make that statement. Circom has opened up new possibilities for creating privacy-preserving applications, such as digital identities, voting systems, and financial transactions, where proving the validity of a statement is necessary, but keeping the underlying data private is critical.

Although there are quite a lot of implementations of Circom online, I feel like there is a lack of documentation and explanation. For this reason, I have created this book, where we examine circuits and explain how they do what they do.

Throughout this book, we always try to make use of `in` and `out` signal naming convention if the circuit permits.
