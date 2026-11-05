# MiMC

[MiMC](https://eprint.iacr.org/2016/492.pdf) by Albrecht, Grassi, Rechberger, Roy and Tiessen is one of the first hash functions designed for circuits, and it is remarkably simple. Its name stands for "Minimal Multiplicative Complexity", as it aims to use as few multiplications as possible. It was used by early zero-knowledge applications such as [Tornado Cash](https://github.com/tornadocash/tornado-core), and while [Poseidon](./poseidon.md) is preferred today, MiMC is a great way to see how such a hash function works.

Circomlib has two variants of MiMC, and we explain both of them here, using Circomlib's own code. Our tests check these circuits against a short TypeScript implementation of the formulas below, which reads the round constants from Circomlib's sources.

## `MiMC7`

```cs
template MiMC7(nrounds) {
    signal input x_in;
    signal input k;
    signal output out;

    var c[91] = [
        0,
        20888961410941983456478427210666206549300505294776164667214940546594746570981,
        // ... 89 more constants
    ];

    var t;
    signal t2[nrounds];
    signal t4[nrounds];
    signal t6[nrounds];
    signal t7[nrounds-1];

    for (var i=0; i<nrounds; i++) {
        t = (i==0) ? k+x_in : k + t7[i-1] + c[i];
        t2[i] <== t*t;
        t4[i] <== t2[i]*t2[i];
        t6[i] <== t4[i]*t2[i];
        if (i<nrounds-1) {
            t7[i] <== t6[i]*t;
        } else {
            out <== t6[i]*t + k;
        }
    }
}
```

`MiMC7` is a [block cipher](https://en.wikipedia.org/wiki/Block_cipher): it encrypts a field element `x_in` with a key `k`. Each round adds the key and a round constant $c_i$ to the state, and raises the result to the power of 7:

$$
x \mapsto (x + k + c_i)^7
$$

After 91 rounds, the key is added one more time to get the output. The first round constant $c_0$ is 0, which is why the first round is just `k + x_in`.

### Why $x^7$ and 91 Rounds?

Just like the S-box of Poseidon, $x \mapsto x^7$ must be a permutation of the field so that encryption can be reversed, and that requires $\gcd(7, p - 1) = 1$. For BN254, this holds for 7 (and 5), but not for 3.

The number of rounds comes from a simple argument: after $r$ rounds, the output is a polynomial of degree $7^r$ in the input. If the degree is small, an attacker could recover the polynomial by interpolation. So we want $7^r \geq p$, which gives:

$$
r = \lceil \log_7 p \rceil = 91
$$

### Cost

Computing $t^7$ takes 4 multiplications: $t^2$, $t^4 = t^2 \cdot t^2$, $t^6 = t^4 \cdot t^2$ and $t^7 = t^6 \cdot t$. That is 4 constraints per round, so `MiMC7(91)` has $4 \cdot 91 = 364$ constraints.

## `MultiMiMC7`

```cs
template MultiMiMC7(nInputs, nRounds) {
    signal input in[nInputs];
    signal input k;
    signal output out;
    signal r[nInputs +1];

    component mims[nInputs];

    r[0] <== k;
    for (var i=0; i<nInputs; i++) {
        mims[i] = MiMC7(nRounds);
        mims[i].x_in <== in[i];
        mims[i].k <== r[i];
        r[i+1] <== r[i] + in[i] + mims[i].out;
    }

    out <== r[nInputs];
}
```

A block cipher is not a hash function yet. `MultiMiMC7` turns it into one using the [Miyaguchi–Preneel](https://en.wikipedia.org/wiki/One-way_compression_function#Miyaguchi%E2%80%93Preneel) construction: each input is encrypted with the current state as the key, and the result is added to both the state and the input:

$$
r_0 = k \qquad r_{i+1} = r_i + x_i + \text{MiMC7}_{r_i}(x_i)
$$

The final $r_n$ is the hash. This costs one `MiMC7` per input, i.e. 364 constraints per input.

## `MiMCSponge`

```cs
template MiMCFeistel(nrounds) {
    signal input xL_in;
    signal input xR_in;
    signal input k;
    signal output xL_out;
    signal output xR_out;

    // doesn't contain the first and last round constants, which are always zero
    var c_partial[218] = [
      // 218 constants
    ];

    var t;
    signal t2[nrounds];
    signal t4[nrounds];
    signal xL[nrounds-1];
    signal xR[nrounds-1];

    var c;
    for (var i=0; i<nrounds; i++) {
        if ((i == 0) || (i == nrounds - 1)) {
          c = 0;
        } else {
          c = c_partial[i - 1];
        }
        t = (i==0) ? k+xL_in : k + xL[i-1] + c;
        t2[i] <== t*t;
        t4[i] <== t2[i]*t2[i];
        if (i<nrounds-1) {
          var aux = (i==0) ? xR_in : xR[i-1] ;
          xL[i] <== aux + t4[i]*t;
          xR[i] <== (i==0) ? xL_in : xL[i-1];
        } else {
          xR_out <== xR[i-1] + t4[i]*t;
          xL_out <== xL[i-1];
        }
    }
}
```

The other variant uses a [Feistel network](https://en.wikipedia.org/wiki/Feistel_cipher) with a state of two elements, $x_L$ and $x_R$. In each round, the left element goes through $x \mapsto (x + k + c_i)^5$, the result is added to the right element, and the two are swapped:

$$
(x_L, x_R) \mapsto \left(x_R + (x_L + k + c_i)^5,\ x_L\right)
$$

In the last round, the elements are not swapped. Since each round only changes one of the two elements, a Feistel network needs twice as many rounds: $2 \cdot \lceil \log_5 p \rceil = 2 \cdot 110 = 220$. The first and last round constants are 0, which is why Circomlib only stores the other 218.

Each round costs 3 constraints, for $t^2$, $t^4$ and $t^5$, so `MiMCFeistel(220)` has 660 constraints.

```cs
template MiMCSponge(nInputs, nRounds, nOutputs) {
  signal input ins[nInputs];
  signal input k;
  signal output outs[nOutputs];

  var i;

  // S = R||C
  component S[nInputs + nOutputs - 1];

  for (i = 0; i < nInputs; i++) {
    S[i] = MiMCFeistel(nRounds);
    S[i].k <== k;
    if (i == 0) {
      S[i].xL_in <== ins[0];
      S[i].xR_in <== 0;
    } else {
      S[i].xL_in <== S[i-1].xL_out + ins[i];
      S[i].xR_in <== S[i-1].xR_out;
    }
  }

  outs[0] <== S[nInputs - 1].xL_out;

  for (i = 0; i < nOutputs - 1; i++) {
    S[nInputs + i] = MiMCFeistel(nRounds);
    S[nInputs + i].k <== k;
    S[nInputs + i].xL_in <== S[nInputs + i - 1].xL_out;
    S[nInputs + i].xR_in <== S[nInputs + i - 1].xR_out;
    outs[i + 1] <== S[nInputs + i].xL_out;
  }
}
```

With a state of two elements, we can build a [sponge](https://en.wikipedia.org/wiki/Sponge_function): $x_L$ is the _rate_ where the inputs are absorbed and the outputs are squeezed, and $x_R$ is the _capacity_ that is never touched directly.

- **Absorb:** for each input, add it to $x_L$ and apply the permutation.
- **Squeeze:** the first output is $x_L$. For each additional output, apply the permutation again and output $x_L$.

So `MiMCSponge(2, 220, 1)`, which hashes two elements into one (e.g. two children of a Merkle tree node, as in Tornado Cash) has $2 \cdot 660 = 1320$ constraints.

## MiMC vs. Poseidon

| Hash                    | Inputs | Constraints |
| ----------------------- | ------ | ----------- |
| `MultiMiMC7(2, 91)`     | 2      | 728         |
| `MiMCSponge(2, 220, 1)` | 2      | 1320        |
| `Poseidon(2)`           | 2      | 240         |

MiMC applies its S-box to a single element in every round, so it needs many rounds and its cost grows with each input. Poseidon processes all inputs at once in a single permutation, and with its [partial rounds](./poseidon.md#full--partial-rounds) it needs only 81 S-boxes for 2 inputs. That is why Poseidon has replaced MiMC in most new applications.
