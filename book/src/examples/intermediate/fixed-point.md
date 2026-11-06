# Fixed-Point Arithmetic

Circuits only know field elements, but many real computations need fractions: prices, interest rates, or the weights of a machine learning model. Floating-point numbers are far too complex for a circuit, so we use **fixed-point** numbers instead, which are simply integers with an implied scale. This is how zkML libraries such as [circomlib-ml](https://github.com/socathie/circomlib-ml) represent the numbers of a neural network.

## Representation

A fixed-point number $x$ with $F$ fractional bits is stored as the integer $x \cdot 2^F$. With $F = 16$:

| Number   | Stored as                    |
| -------- | ---------------------------- |
| $1$      | $65536$                      |
| $1.5$    | $98304$                      |
| $0.001$  | $66$, rounded                |
| $-1.5$   | $p - 98304$                  |

Negative numbers are just negative field elements, i.e. $p - |x|$, as described in [Finite Fields](../../arithmetic/finite-fields.md#there-are-no-negative-numbers). We call a number **$N$-bit** if its stored integer is in $[-2^{N-1}, 2^{N-1})$. Our circuits are written for any $N$ and $F$, and the tests use $N = 32, F = 16$.

> We use a power of two as the scale, so that rescaling is just dropping bits. A power of ten such as $10^{18}$ (as used by circomlib-ml, and by Ethereum tokens) works as well, but it needs an [integer division](../../arithmetic/int-div.md) instead.

## Addition Is Free

The sum of two fixed-point numbers is the sum of their integers, as $x \cdot 2^F + y \cdot 2^F = (x + y) \cdot 2^F$. So addition, subtraction, and multiplication by an integer constant are free, just like with integers.

## Multiplication Needs Rescaling

The product of two fixed-point numbers has the wrong scale:

$$
(x \cdot 2^F) \cdot (y \cdot 2^F) = (x \cdot y) \cdot 2^{2F}
$$

So after multiplying, we must divide by $2^F$, i.e. drop the lowest $F$ bits. In a field, there is no "drop the bits" operation, so we decompose the number into bits and add back only the ones we keep.

### Rounding Signed Numbers

Decomposing into bits only works for non-negative numbers, as a negative number is a huge field element. So we first shift the number by $2^{M-1}$, which maps the signed range $[-2^{M-1}, 2^{M-1})$ to $[0, 2^M)$, drop the bits, and then undo the shift:

```cs
{{#include ../../../../circuits/examples/intermediate/fixed-point.circom:FixedPointRescale}}
```

Since the shift $2^{M-1}$ is a multiple of $2^F$, undoing it after dropping $F$ bits gives exactly $\lfloor x / 2^F \rfloor$, i.e. the result is **rounded down**, also for negative numbers: $-0.001 \times 0.001$ becomes $-2^{-16}$, not $0$.

The bit decomposition has another job as well: it checks that the input actually has $M$ bits. Without it, a number such as $2^{M-1}$ would wrap around after the shift, and give a wrong result.

## Multiplication

```cs
{{#include ../../../../circuits/examples/intermediate/fixed-point.circom:AssertSigned}}
```

```cs
{{#include ../../../../circuits/examples/intermediate/fixed-point.circom:FixedPointMul}}
```

We [range-check](../../pitfalls.md#comparisons-need-range-checks) the inputs, so that we know the size of their product. An $N$-bit number is at least $-2^{N-1}$, so the product is at most $(-2^{N-1})^2 = 2^{2N-2}$.

Careful here: $2^{2N-2}$ itself is not a $(2N-1)$-bit signed number, which goes up to $2^{2N-2} - 1$! The square of the smallest number is the single product that does not fit, so we rescale with $2N$ bits. The tests multiply the extreme values to catch exactly this kind of off-by-one.

Note that the output is not range-checked: the product of two $N$-bit numbers may need more than $N$ bits, e.g. $1000 \times 1000$ does not fit in $N = 32, F = 16$, whose largest number is just under $2^{15} = 32768$. If the output is used in another multiplication, that multiplication checks its range anyway.

## Dot Product

Most of the arithmetic in a neural network is in dot products, $a_0 b_0 + \ldots + a_{n-1} b_{n-1}$. Rescaling costs $M$ constraints, which is much more than the multiplication itself, so we do not rescale each product. Instead, we add up the products with $2F$ fractional bits, which is free, and rescale only once at the end:

```cs
{{#include ../../../../circuits/examples/intermediate/fixed-point.circom:FixedPointDot}}
```

The sum of $n$ products is larger than a single one, so we need $\lceil \log_2 n \rceil$ more bits, which is about `nbits(n)`. As a bonus, rescaling once also rounds once, so the result is more accurate.

## Beyond Dot Products

With these, you can build a whole neural network layer: a matrix-vector product is $n$ dot products, and adding a bias is free. The activation functions are harder:

- **ReLU** is $\max(0, x)$, which needs the sign of $x$. In `FixedPointRescale`, the sign is the top bit of the shifted number, so it is almost free to get!
- **Sigmoid** and other smooth functions have no exact form, so they are replaced with a polynomial approximation, which only needs multiplications and additions.

## Constraint Count

| Circuit                     | non-linear constraints |
| --------------------------- | ---------------------- |
| `FixedPointMul(32, 16)`     | 129                    |
| `FixedPointDot(4, 32, 16)`  | 327                    |
| `FixedPointDot(100, 32, 16)` | 6571                  |

`FixedPointMul(N, F)` has $2N$ constraints for range-checking the inputs, 1 for the product, and $2N$ for rescaling, so $4N + 1$. `FixedPointDot(n, N, F)` has $n(2N + 1)$ for the range checks & products, and $2N + $ `nbits(n)` for a single rescale. Rescaling each product separately would add $2N$ constraints per product, about 6400 more for $n = 100$.

## See Also

- [Integer Division](../../arithmetic/int-div.md), for rescaling with a scale that is not a power of two.
- [circomlib-ml](https://github.com/socathie/circomlib-ml), which implements the layers of a neural network in Circom.
