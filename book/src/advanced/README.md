# Advanced

The world of Circom is vast, and here we take a look at some more advanced concepts.

## Alternative Provers

SnarkJS is not the only option to prove Circom circuits, you can check out some alternative provers in other languages as well:

- [Go-Rapidsnark](https://github.com/iden3/go-rapidsnark/) is a collection of Go packages by Iden3, that allow you to compute witnesses, generate, or verify Circom proofs.
- [Ark-Circom](https://github.com/arkworks-rs/circom-compat) has Arkworks bindings to Circom's R1CS for proof & witness generation.
- [Lambdaworks](https://github.com/lambdaclass/lambdaworks) has Circom adapters for Groth16.

However, these are not as capable as SnarkJS, e.g. they only support Groth16 protocol.

## Large Circuits

If you have very large circuits (e.g. >20M constraints) you will have some practical problems, most notably the limited memory of your machine. There is a great HackMD post that describes what the best practices are for large circuits, see [here](https://hackmd.io/V-7Aal05Tiy-ozmzTGBYPA?view#Best-Practices-for-Large-Circuits).
