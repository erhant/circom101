# Constant Comparisons

Circomlib comes with a more efficient method when we are comparing one signal with another constant. In this section, we will explain the constant-comparison method along with several of its usages.

These methods depend on the prime field used within the circuit, and therefore re-using these same circuits may cause bugs due to hard-coded values in other prime fields!

Note that these circuits take the bits of a number as input, but do not constrain them to be bits; the caller must ensure that, e.g. by obtaining them from `Num2Bits`.

## `CompConstant`

```cs
{{#include ../../../circuits/comparators/constant.circom:CompConstant}}
```

`CompConstant` returns 1 if `in > constant`, where `in` is given as 254 bits and `constant` is known at compile time. This circuit comes from Circomlib, and it looks rather mysterious at first. Let us take it apart piece by piece.

### Comparing Digit by Digit

Think of how you compare two numbers by hand: you look at their digits from the most significant one, and the first digit where they differ decides the result. For example, $5\textbf{3}21 > 5\textbf{2}99$ because of the second digit, no matter what the remaining digits are.

`CompConstant` does the same, but instead of decimal digits it uses **pairs of bits**, i.e. base-4 digits. The 254 bits of `in` make up 127 pairs, `in[2i]` being the least-significant bit (`in_lsb`) and `in[2i+1]` the most-significant bit (`in_msb`) of the $i$'th pair. The same is done for the constant, which is known at compile time, so its pairs are just numbers.

For each pair $i$, we compare the digit of `in` (call it $s_i$) with the digit of the constant (call it $c_i$) using two bits:

- `part_bit_a` is 1 if $s_i \geq c_i$
- `part_bit_b` is 1 if $s_i > c_i$

Since $c_i$ is a constant, we can write these with a simple expression for each of its four possible values, where $s_i = 2 \cdot \texttt{in\_msb} + \texttt{in\_lsb}$:

| $c_i$ | $s_i \geq c_i$                          | $s_i > c_i$                             |
| ----- | --------------------------------------- | --------------------------------------- |
| 0     | always                                  | either bit is set, `OR(in_msb, in_lsb)` |
| 1     | either bit is set, `OR(in_msb, in_lsb)` | $s_i \in \{2, 3\}$, `in_msb`            |
| 2     | $s_i \in \{2, 3\}$, `in_msb`            | $s_i = 3$, `AND(in_msb, in_lsb)`        |
| 3     | $s_i = 3$, `AND(in_msb, in_lsb)`        | never                                   |

These are exactly the four branches in the loop, using the [logic gates](../bits/logic-gates.md) `OR(x, y) = x + y - xy` and `AND(x, y) = xy`.

### Weighting the Digits

Next, each pair contributes a part to a sum:

```cs
parts[i] <== (a * (1 - part_bit_a)) + (b * part_bit_b);
```

There are three cases here:

- $s_i < c_i$: both bits are 0, so we add `a`.
- $s_i = c_i$: only `part_bit_a` is 1, so we add 0.
- $s_i > c_i$: both bits are 1, so we add `b`.

What are `a` and `b`? They start at $a = 1$ and $b = 2^{128} - 1$, and at the end of each iteration `a` grows by `bit_value` and `b` shrinks by `bit_value`, which doubles every time. Following the loop, at pair $i$ we have:

$$
a_i = 2^i \qquad b_i = 2^{128} - 2^i
$$

Here is the idea behind these values. Suppose we could add $+2^i$ for a pair where `in` is smaller, and $-2^i$ for a pair where `in` is larger. The most significant differing pair, say at position $k$, contributes $\pm 2^k$, and all the pairs below it can contribute at most

$$
2^{k-1} + 2^{k-2} + \ldots + 1 = 2^k - 1 < 2^k
$$

So, just like comparing by hand, the most significant differing pair decides the sign of the sum: it is negative if and only if `in > constant`.

The problem is that there are no negative numbers in our circuits, only field elements. So instead of $-2^i$, `CompConstant` uses $2^{128} - 2^i$, which is how $-2^i$ is represented in 128-bit [two's complement](https://en.wikipedia.org/wiki/Two%27s_complement). That is $b_i$, while $a_i = 2^i$ is the positive term.

### Reading the Sign

In 128-bit two's complement, the sign is the bit 127: a number is negative if and only if its bit 127 is set. So at the end, we decompose the sum into bits with `Num2Bits` and return its bit 127.

The sum itself is not a 128-bit number though, since every "greater" pair adds a $2^{128}$ on top. If there are $w$ such pairs, the sum is:

$$
w \cdot 2^{128} + \left( \sum_{\text{less}} 2^i - \sum_{\text{greater}} 2^i \right)
$$

The $w \cdot 2^{128}$ part only affects the bits from 128 and above, so the bits 0 to 127 are exactly the two's complement form of the bracketed difference. In other words, we only read bit 127 and ignore the rest.

As an example, let the constant be $6$, which is $12$ in base-4. Here is what happens for a few inputs:

| `in` | base-4 | pair 1                 | pair 0                 | sum           | bit 127 | `out` |
| ---- | ------ | ---------------------- | ---------------------- | ------------- | ------- | ----- |
| 3    | $03$   | less, $2$              | greater, $2^{128} - 1$ | $2^{128} + 1$ | 0       | 0     |
| 5    | $11$   | equal, $0$             | less, $1$              | $1$           | 0       | 0     |
| 6    | $12$   | equal, $0$             | equal, $0$             | $0$           | 0       | 0     |
| 7    | $13$   | equal, $0$             | greater, $2^{128} - 1$ | $2^{128} - 1$ | 1       | 1     |
| 8    | $20$   | greater, $2^{128} - 2$ | less, $1$              | $2^{128} - 1$ | 1       | 1     |

Notice the first row: the lower pair is "greater", so the sum goes beyond $2^{128}$, but it is the higher pair that decides, and bit 127 correctly stays 0.

### Why 135 Bits?

The largest possible sum is when all 127 pairs are "greater":

$$
\sum_{i=0}^{126} \left(2^{128} - 2^i\right) = 127 \cdot 2^{128} - (2^{127} - 1) < 2^{135}
$$

So 135 bits are enough to decompose the sum, and we need all of them even though only bit 127 is used: with fewer bits, `Num2Bits` would fail for large sums. The `_ <== num2bits.out` line tells the compiler that the other bits are unused on purpose.

### Why Pairs of Bits?

It may seem simpler to compare bit by bit, but then we would have 254 digits with weights up to $2^{253}$, and we would need 254-bit two's complement. The sum would be around $254 \cdot 2^{254}$, way larger than the order of the field ($p < 2^{254}$), so it would wrap around and the trick would break.

With pairs, there are only 127 digits, the sum stays below $2^{135}$, and it never wraps around. Comparing a pair with a constant digit still takes a single multiplication (`in_msb * in_lsb`), so each part is one constraint. In total, `CompConstant` has 262 non-linear constraints: 127 for the parts, and 135 for the decomposition. Compare that with a `LessThan(254)`, which is not even possible since `LessThan` requires `n <= 252`!

## `AliasCheck`

```cs
{{#include ../../../circuits/comparators/constant.circom:AliasCheck}}
```

Alias check simply asserts that a given 254-bit number is within the prime field of BN254. The role of -1 there is just a short-cut to obtain the largest number within the field, $p - 1$.

Why would we need this? 254 bits can represent numbers up to $2^{254} - 1$, which is larger than $p$. So a field element $x$ may have two different 254-bit representations, $x$ and $x + p$, which are called _aliases_. If a circuit uses `Num2Bits(254)` without an alias check, a dishonest prover can pick the bits of $x + p$ instead of $x$. `AliasCheck` asserts that the bits represent a number $\leq p - 1$, which rules out the alias.

## `Sign`

```cs
{{#include ../../../circuits/comparators/constant.circom:Sign}}
```

In a prime field, a field element is defined to be positive if it is closer to 0 than it is to the order of the field. `Sign` checks for that property and returns 0 if the number is positive, otherwise 1 if the number is negative. Specifically, for order $p$ and a number $n < p$ the sign of $n$ is:

- positive when $n \leq (p-1)/2$
- negative when $n > (p-1)/2$

Here, `1 / 2` is a field division, i.e. the inverse of 2, which is $(p+1)/2$. So `half - 1` is $(p-1)/2$, and `CompConstant` returns 1 exactly when the number is negative.

## Constraint Count

| Circuit        | Constraints |
| -------------- | ----------- |
| `CompConstant` | 262         |
| `AliasCheck`   | 261         |
| `Sign`         | 262         |

Note that these take the bits of a number as input, so if you also need to decompose a number into bits with `Num2Bits(254)`, that is another 254 constraints.
