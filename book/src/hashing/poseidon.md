# Poseidon

[Poseidon](https://eprint.iacr.org/2019/458.pdf) is a hash function designed by Grassi, Khovratovich, Rechberger, Roy and Schofnegger specifically for zero-knowledge proof systems. It works natively over the field of the circuit, and it is the most commonly used hash function in Circom.

Circomlib's `Poseidon` is a heavily optimized implementation, which can be hard to read. The circuit below is a plain implementation of the same hash, written as described in the paper. It uses the same constants as Circomlib, and our tests confirm that it gives the same output as Circomlib's `Poseidon` (via [poseidon-lite](https://github.com/vimwitch/poseidon-lite)) for 1, 2, 3, 5 and 16 inputs.

## `PoseidonHash`

```cs
{{#include ../../../circuits/hashing/poseidon.circom:SBox}}

{{#include ../../../circuits/hashing/poseidon.circom:PoseidonHash}}
```

## The Permutation

At the heart of Poseidon is a **permutation** over a state of $t$ field elements. To hash $n$ inputs, we use a state of $t = n + 1$ elements: the inputs, and one extra element called the _capacity_, which starts as 0. The state is then scrambled through many rounds, and the first element of the final state is the hash.

> This is the [sponge construction](https://en.wikipedia.org/wiki/Sponge_function): inputs are "absorbed" into the state, the permutation is applied, and the output is "squeezed" from the state. Circomlib uses a single permutation, so it can hash at most 16 inputs at once.

Each round consists of three steps:

1. **Add round constants:** a different constant is added to each element of the state, so that the rounds are not all the same.
2. **S-box:** each element is raised to the power of 5, i.e. $x \mapsto x^5$. This is the only non-linear step.
3. **Mix:** the state is multiplied with a $t \times t$ [MDS matrix](https://en.wikipedia.org/wiki/MDS_matrix), so that every element affects every other element in the next round.

The constants and the matrices are generated once by a script from the authors, and Circomlib has them in `poseidon_constants_old.circom`, which we include here.

### Why $x^5$?

The S-box must be a permutation of the field, otherwise two different states could map to the same one. The map $x \mapsto x^\alpha$ is a permutation exactly when $\gcd(\alpha, p - 1) = 1$. For BN254, $p - 1$ is divisible by 3, so $x^3$ does not work, and $\alpha = 5$ is the smallest exponent that does. It costs 3 constraints, as seen in `SBox`:

$$
x^2 = x \cdot x \qquad x^4 = x^2 \cdot x^2 \qquad x^5 = x^4 \cdot x
$$

## Full & Partial Rounds

Here is the clever part of Poseidon. The S-box is the only expensive step, so Poseidon uses two kinds of rounds:

- **Full rounds** apply the S-box to _all_ $t$ elements. There are $R_F = 8$ of them: 4 at the beginning and 4 at the end. They protect against statistical attacks, such as differential and linear cryptanalysis.
- **Partial rounds** apply the S-box to _only the first_ element. There are $R_P$ of them in the middle, between 56 and 70 depending on $t$. They are cheap, yet they still increase the algebraic degree of the permutation, which protects against algebraic attacks.

The number of partial rounds for each $t$ is in the `N_ROUNDS_P` table, as computed by the authors' script. With this design, the number of S-boxes is $t \cdot R_F + R_P$ instead of $t \cdot (R_F + R_P)$.

## Constraint Count

The round constants and the MDS matrix are all known at compile time, so adding them and multiplying with them are linear operations, and they cost no non-linear constraints at all. Only the S-boxes cost constraints, 3 each:

$$
3 \cdot (t \cdot R_F + R_P)
$$

For 2 inputs, that is $t = 3$ and $R_P = 57$, so $3 \cdot (3 \cdot 8 + 57) = 243$. In fact, the compiler finds 240 non-linear constraints with `--O2`, because in the very first round the capacity element is a constant ($0$ plus a round constant), so its S-box is computed at compile time.

| Inputs | $t$ | $R_P$ | S-boxes | Constraints (`--O2`) |
| ------ | --- | ----- | ------- | -------------------- |
| 1      | 2   | 56    | 72      | 213                  |
| 2      | 3   | 57    | 81      | 240                  |
| 16     | 17  | 68    | 204     | 609                  |

## Circomlib's Optimized Version

Circomlib's `Poseidon` computes the very same hash, and has the very same number of non-linear constraints. So what is optimized? Look again at the partial rounds: only one element goes through the S-box, while the other $t - 1$ elements just go through the linear layers. The Poseidon paper describes how to take advantage of this:

- The round constants of the partial rounds can be moved through the linear layers, so that only the first element needs a constant in each partial round. The rest are merged into the constants of the other rounds.
- The MDS matrix in the partial rounds can be replaced by one dense matrix (`P` in Circomlib) followed by a **sparse** matrix for each partial round (`S` in Circomlib), applied by the `MixS` template. A sparse matrix only multiplies the first element with each of the others, so it has about $2t$ entries instead of $t^2$.

In R1CS, these linear operations end up inside the non-linear constraints as linear combinations, so fewer terms make the R1CS smaller. For example, with `--O2` and 2 inputs, Circomlib's `Poseidon` has an R1CS file of about 114KB, while our plain implementation has about 247KB, with the same 240 constraints.

> Circomlib also has `PoseidonEx(nInputs, nOuts)`, which lets you set the initial value of the capacity element and returns more than one element of the final state. `Poseidon(nInputs)` is simply `PoseidonEx(nInputs, 1)` with an initial state of 0.
