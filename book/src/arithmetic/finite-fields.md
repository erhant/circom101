# Finite Fields

The values in a Circom circuit are not integers: every signal is an element of a **finite field**. Most of the time you will not notice the difference, but many of the bugs in [Common Pitfalls](../pitfalls.md) come from forgetting it. So before writing any circuits, let us take a quick look at what these numbers are.

## What Is a Field?

A field is a set of numbers where you can add, subtract, multiply, and divide by anything except zero, and the result always stays within the set. The usual rules apply, e.g. $a + b = b + a$ and $a \times (b + c) = a \times b + a \times c$. The rational numbers and the real numbers are fields, while the integers are not, as $1 / 2$ is not an integer.

A _finite_ field has a finite number of elements. The one we use is made of the integers modulo a prime $p$:

$$
\mathbb{F}_p = \{0, 1, 2, \ldots, p - 1\}
$$

> If you are interested in the formal definitions, which build up from groups to rings and then to fields, see [Field](<https://en.wikipedia.org/wiki/Field_(mathematics)>) and [Finite field](https://en.wikipedia.org/wiki/Finite_field). They are not needed to write good Circom code, though.

## Arithmetic Modulo $p$

Every operation in the field is done modulo $p$: we compute the result as usual, and then take the remainder after dividing by $p$. Here are a few examples with the tiny prime $p = 7$:

| Operation   | Result                                    |
| ----------- | ----------------------------------------- |
| $5 + 4$     | $9 \bmod 7 = 2$                           |
| $3 \times 5$ | $15 \bmod 7 = 1$                         |
| $2 - 5$     | $-3 \bmod 7 = 4$                          |
| $-1$        | $6$, since $6 + 1 = 7 \bmod 7 = 0$        |
| $1 / 2$     | $4$, since $2 \times 4 = 8 \bmod 7 = 1$   |
| $3 / 2$     | $5$, since $2 \times 5 = 10 \bmod 7 = 3$  |

Why must $p$ be a prime? Because only then does every non-zero element have an inverse, so that division always works. Modulo 6, for example, $2 \times x$ is always even, so it can never be 1, and $1 / 2$ does not exist.

By default, Circom uses the prime of the BN254 elliptic curve, which is the one used by Ethereum's precompiles:

$$
p = 21888242871839275222246405745257275088548364400416034343698204186575808495617
$$

You can choose a different prime with the `--prime` option of the compiler, such as `bls12381` or `goldilocks`. Throughout this book we use BN254.

## There Are No Negative Numbers

In the field, $-1$ is simply $p - 1$, which is the _largest_ element. So a "negative" number is really a huge number, and there is no notion of an element being smaller or larger than another that is preserved by arithmetic: with $p = 7$, we have $6 > 5$, but $6 + 1 = 0$ while $5 + 1 = 6$.

This is why comparing two signals is not trivial in a circuit: we must decompose them into bits, and make sure that they are small enough. See [Comparators](../comparators/) for how it is done, and [Common Pitfalls](../pitfalls.md#there-are-no-negative-numbers) for what happens when it is forgotten.

> To make things more confusing, Circom's relational operators such as `<` treat the elements larger than $p / 2$ as negative numbers, so `-1 < 0` is true in Circom code! This only affects the code that computes values, e.g. with `var` and `<--`; constraints can not compare at all. See [`nbits`](../bits/#function-nbits) for an example where this matters.

## Division

Division in the field is multiplication with the inverse: $a / b = a \times b^{-1}$, where $b^{-1}$ is the element such that $b \times b^{-1} = 1$. Computing an inverse is expensive, so in a circuit we compute it outside of the constraints, and only check that $b \times b^{-1} = 1$, as described in [Inversion](./inverse.md).

Circom has two division operators, and it is important to not mix them up:

- `/` is the division in the field, so `1 / 2` is $(p + 1) / 2$, the element that gives 1 when multiplied by 2.
- `\` is the integer division, along with `%` for the remainder, so `7 \ 2` is 3. These are not field operations, so they can only be used to compute values, and must be checked with constraints, as described in [Integer Division](./int-div.md).

## The Size of $p$

The BN254 prime has 254 bits, so every element fits in 254 bits. However, not every 254-bit number is an element: $2^{254}$ is larger than $p$. This has a few consequences that come up throughout the book:

- A number with up to 253 bits is always an element, so decomposing it into bits is safe. That is why [`Num2Bits(n)`](../bits/#num2bits) requires $n < 254$.
- A 254-bit decomposition may have two solutions for the same element, $x$ and $x + p$, called aliases. They are ruled out with an [alias check](../comparators/constant.md#aliascheck).
- Arithmetic wraps around at $p$, so an equation such as $a = q \times b + r$ only holds over the integers if the values are small enough, as in [Integer Division](./int-div.md).

## Try It Yourself

You can see the field in action with `log`, which prints the values while computing a witness:

```cs
template Field() {
  signal input in;

  log("-1 =", -1);
  log("1 / 2 =", 1 / 2);
  log("7 \\ 2 =", 7 \ 2);
}
```

This prints:

```
-1 = 21888242871839275222246405745257275088548364400416034343698204186575808495616
1 / 2 = 10944121435919637611123202872628637544274182200208017171849102093287904247809
7 \ 2 = 3
```

Adding 1 to the first number gives you $p$ itself.
