# Filtering Tuples

This example is a solution to a ZK puzzle from the [Axiom Open Source Program](https://hackmd.io/@axiom/rkIujYOt2):

> Write a circuit that takes a fixed-length array `in` of 100 tuples and an arbitrary value `match`, and outputs:
>
> - `num_match`, the number of tuples whose first entry is `match`
> - `out`, an array of 100 tuples where the first `num_match` entries are the matching tuples, and the rest are 0-padded
>
> The goal is to minimize the number of non-linear constraints.

For example, if `match = 5` and the input is `[[6, 8], [5, 5], [7, 6], [5, 4], ...]`, the output starts with `[[5, 5], [5, 4], ...]`, keeping the matching tuples in their original order. Our solution is generic over the number of tuples `n`, and the challenge is `Filter(100)`.

## `Filter`

```cs
{{#include ../../../../circuits/examples/advanced/filter.circom:Filter}}
```

With 100 tuples, this circuit has **3203** non-linear constraints. Let us see how we get there.

## The Naive Approach

First, we find the matching tuples with `IsEqual`, and count them as we go:

$$
m_i = [\texttt{in}[i][0] = \texttt{match}] \qquad c_i = m_0 + m_1 + \ldots + m_{i-1}
$$

A matching tuple `i` goes to the slot $c_i$, i.e. the number of matching tuples before it. Since $c_i$ is just a sum, it costs nothing. Then, each output slot `k` can pick its tuple as:

$$
\texttt{out}[k] = \sum_{i} m_i \cdot [c_i = k] \cdot \texttt{in}[i]
$$

This is correct, but every pair of `i` and `k` needs an `IsEqual` and a few multiplications. That is about $n^2/2$ pairs, and for 100 tuples it adds up to **25447** non-linear constraints. We can do much better.

## The First Entries Are Free

Notice that we do not need to move the first entries at all: the first entry of a matching tuple is `match` itself! So `out[k][0]` is `match` for the first `num_match` slots, and 0 for the rest:

```cs
out[j][0] <== match * isFilled[j];
```

where `isFilled = [1, ..., 1, 0, ..., 0]` has exactly `num_match` ones. We let the prover provide `isFilled`, and constrain it as follows:

```cs
isFilled[0] * (isFilled[0] - 1) === 0;
for (var j = 1; j < n; j++) {
  isFilled[j] * (isFilled[j - 1] - isFilled[j]) === 0;
}
```

The first constraint makes `isFilled[0]` a bit. The others say that each entry is either 0, or equal to the previous one. So all entries are bits, and once there is a 0 the rest are all 0. Finally, their sum must be `num_match`, which leaves only one possible `isFilled`. That is just one constraint per slot, plus one more for the multiplication with `match`.

Now, only the second entries must be moved around.

## Moving Left with a Log-Shifter

Instead of thinking which tuple goes to each slot, let us think how far each tuple must move. A matching tuple `i` goes to slot $c_i$, so it moves to the left by:

$$
s_i = i - c_i
$$

which is the number of non-matching tuples before it. Again, this is a sum, so it is free. We could move each tuple by $s_i$ in one step, but that is again an array access with a variable index. Instead, we break the shift into its bits:

$$
s_i = \sum_{b} 2^b \cdot \texttt{bit}_b(s_i)
$$

and move the tuples in **stages**: at stage $b$, a tuple moves to the left by $2^b$ if its bit $b$ is set. After all the stages, every tuple has moved by exactly $s_i$. Since $s_i < n$, we need only $\lceil \log_2 n \rceil$ stages, which is 7 for 100 tuples.

As an example, let `a` be the `match` value, and `x` be something else:

| slot                   | 0       | 1       | 2       | 3       | 4       | 5       | 6       | 7 |
| ---------------------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | - |
| input                  | $a_0$   | x       | $a_2$   | x       | x       | $a_5$   | $a_6$   | x |
| shift                  | 0       |         | 1       |         |         | 3       | 3       |   |
| after stage 0 (by 1)   | $a_0$   | $a_2$   |         |         | $a_5$   | $a_6$   |         |   |
| after stage 1 (by 2)   | $a_0$   | $a_2$   | $a_5$   | $a_6$   |         |         |         |   |

Here $a_2$ has shift $1 = (01)_2$ so it moves only in stage 0, and $a_5, a_6$ have shift $3 = (11)_2$ so they move in both stages. With 8 tuples there is also a stage 2 (by 4), but here no shift has that bit set, so nothing moves.

### No Collisions

Can two tuples end up in the same slot at some stage? That would be a problem, as they would be added together. Luckily, the answer is no.

Consider two consecutive matching tuples $i < i'$. They go to consecutive slots, so $i' - s_{i'} = i - s_i + 1$, and since $s$ counts the non-matching tuples before each one, we also have $s_{i'} \geq s_i$. After the stages $0, \ldots, b-1$, each tuple has moved by the lower $b$ bits of its shift, i.e. by $s \bmod 2^b$. So the distance between the two tuples is:

$$
\left(i' - (s_{i'} \bmod 2^b)\right) - \left(i - (s_i \bmod 2^b)\right) = (s_{i'} - s_i + 1) - \left((s_{i'} \bmod 2^b) - (s_i \bmod 2^b)\right)
$$

If $s_{i'}$ and $s_i$ have the same higher bits, this is exactly 1. Otherwise, $s_{i'}$ is larger by at least $2^b$ in the higher bits, and the distance is at least $2^b + 1$. Either way the distance is positive, so the tuples never collide, and they also keep their order.

For this to hold, the non-matching tuples must not get in the way. So we simply turn them into zeros, both their value and their shift, and then moving zeros around has no effect at all:

```cs
values[i] <== isMatch[i] * in[i][1];
shifts[i] <== isMatch[i] * (i - count);
```

### A Stage

At stage $b$ with $d = 2^b$, each slot `j` keeps whatever does not leave it, and receives whatever leaves from the slot `j + d`:

$$
\texttt{val}'[j] = \texttt{val}[j] - \texttt{moved}[j] + \texttt{moved}[j + d] \quad\text{where}\quad \texttt{moved}[j] = \texttt{bit}_b \cdot \texttt{val}[j]
$$

Here is the neat part: the product `moved[j]` is used twice, once for leaving slot `j` and once for arriving at slot `j - d`. So a stage costs just **one multiplication per slot** for each value that is moved.

A tuple must also carry the remaining bits of its shift as it moves, as they are needed in the later stages. Those are moved in the same way, again with one multiplication each. The bits are computed once at the start using `Num2Bits`, and they move along with the tuple from then on.

### Skipping the Zeros

A tuple can never move to the left of slot 0. So a tuple in slot `j` has at most `j` slots left to move, which tells us that some bits are always 0:

- The shift of tuple `i` is at most `i`, so it fits in `nbits(i)` bits. The first tuple never moves at all.
- During the stages, the bit $k$ of a tuple in slot `j` can only be set if $j \geq 2^k$.

We skip the multiplications for those, and constrain the corresponding signals to 0 instead, which is not a non-linear constraint.

## Is It Sound?

Almost everything in this circuit is computed with `<==` from the inputs, so there is no room for a dishonest prover. The only values that come from the prover are:

- the inverses within `IsEqual`, which are fixed by its constraints,
- the bits within `Num2Bits`, which are unique for a number that fits in the given bits,
- the `isFilled` mask, which is unique as described above.

So there is exactly one valid witness for each input, and since the shifting never causes a collision, that witness gives the correct output.

## Constraint Count

Here is where the 3203 non-linear constraints of `Filter(100)` come from:

| What                                                | Constraints |
| --------------------------------------------------- | ----------- |
| `IsEqual` for each tuple                            | 200         |
| zeroing the values and shifts                       | 199         |
| `Num2Bits` for the shifts                           | 573         |
| moving the values through the stages                | 573         |
| moving the shift bits through the stages            | 1458        |
| the `isFilled` mask, and `out[j][0]`                | 200         |
| **Total**                                           | **3203**    |

That is about 8 times fewer constraints than the naive approach. Notice that moving the shift bits is the most expensive part; this is the price we pay for not using any variable-index array accesses.
