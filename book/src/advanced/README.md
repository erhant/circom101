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

## Folding

Folding is when a "well-structured" circuit with many iterations is folded into a single "iteration" from which a proof is generated that proves all iterations are correct. See more at [awesome-folding](https://github.com/lurk-lab/awesome-folding).

- A recent work from PSE called [Sonobe](https://github.com/privacy-scaling-explorations/sonobe) paves the way to fold Circom circuits.

- [Nova-Scotia](https://github.com/nalinbhardwaj/Nova-Scotia) is a middleware to compile Circom circuits for the Nova prover.

## Just Logging

If you would like to experiment with some circuit code quickly, [zkRepl](https://zkrepl.dev/) is usually the best option. In any case, if you still want to play locally you can simply write logs in your code and compile your circuit with:

```sh
circom ./your-circuit.circom --verbose
```

This will not emit any build artifacts, it will only print logs.
