# Integer Division

Integer division returns the quotient of two numbers, rounded down, e.g. $7 / 2 = 3$. This is different from the division in a prime field, where $7 / 2$ is the field element that gives 7 when multiplied by 2.

## `IntDiv`

```cs
{{#include ../../../circuits/arithmetic/int-div.circom:IntDiv}}
```

Doing integer division within a circuit is more costly than what one might one expect! Consider two $n$-bit numbers $a$ and $b$. An integer division implies the following equation:

$$
a = q \times b + r
$$

where $q$ is the quotient, and $r$ is the remainder such that $0 \leq r < b$. As an example, consider the division $5/2$. We have:

$$
5 = 2 \times 2 + 1
$$

giving us the quotient $q = 2$ and remainder $r = 1$. Notice that if we allowed $r \geq b$, we could have:

$$
5 = 1 \times 2 + 3
$$

which would be wrong! This is why we constrain the remainder with `LessThan`, to ensure $r < b$.

However, that check alone is not enough. Remember that we are working in a prime field, where a "negative" number such as $-1$ is actually a very large number $p - 1$. Consider the following:

$$
10 = 4 \times 3 + (-2)
$$

This is a quotient $q = 4$ with a remainder $r = -2$, which is wrong since $10 / 3$ should give $q = 3$. Is $-2 < 3$? It should not be in the field, as $-2$ is a very large number there; however, `LessThan(n)` is only correct for $n$-bit inputs! It computes $2^n + r - b = 2^n - 5$, which is an $(n+1)$-bit number with its $n$'th bit unset, so it says that $r < b$. A dishonest prover could then claim that $10 / 3 = 4$.

To prevent this, we range-check both the quotient and the remainder using `Num2Bits(n)`:

- With $0 \leq r < 2^n$, the remainder can not be "negative" anymore, and `LessThan(n)` can safely check $r < b$.
- With $0 \leq q < 2^n$, the quotient can not be a field element like $(a - r) \cdot b^{-1}$, which would satisfy $a = q \times b + r$ in the field for _any_ $r$.

Finally, we must make sure that $q \times b + r$ can not wrap around the field, otherwise the equation $a = q \times b + r$ would only hold "modulo $p$" instead of over the integers. As $q$ and $r$ are $n$-bit numbers, and $b$ can be at most $n+1$ bits (otherwise `LessThan` fails), the result is less than $2^{2n+2}$. The `assert(n <= 125)` ensures that this is less than the prime of BN254, which is around $2^{253}$.

> With these checks, the circuit has a unique solution for given $a$ and $b$: the quotient $q$ and remainder $r$ of the usual integer division.

## Constraint Count

`IntDiv(n)` has $3n + 2$ non-linear constraints, e.g. 50 for 16-bit numbers. Almost all of them come from the bit decompositions: the two range checks of the quotient & the remainder, and the $(n+1)$-bit decomposition within `LessThan`.
