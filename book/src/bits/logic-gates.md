# Logic Gates

It is often required to do some logical operations like `AND`, `OR`, `NOT` and `XOR` within a circuit. For the circuits within this chapter, we can assume that the inputs are asserted to be bits, i.e. they are either 0 or 1.

## `AND`

```cs
template AND() {
  signal input in[2];
  signal output out;

  out <== in[0]*in[1];
}
```

The logic table of `AND` is as follows:

| $\land$ | 0   | 1   |
| ------- | --- | --- |
| 0       | 0   | 0   |
| 1       | 0   | 1   |

This can be achieved by simply multiplying the two inputs!

## `OR`

```cs
template OR() {
  signal input in[2];
  signal output out;

  out <== in[0] + in[1] - in[0]*in[1];
}
```

The logic table of `OR` is as follows:

| $\lor$ | 0   | 1   |
| ------ | --- | --- |
| 0      | 0   | 1   |
| 1      | 1   | 1   |

We _almost_ achieve the result by adding the two numbers, except that we get 2 when both are 1. Well, `AND` is only 1 when both numbers are 1, so we subtract it from the result to solve that issue.

What we have is equivalent to `in[0] + in[1] - AND(in)`.

## `XOR`

```cs
template XOR() {
  signal input in[2];
  signal output out;

  out <== in[0] + in[1] - 2*in[0]*in[1];
}
```

The logic table of `XOR` is as follows:

| $\oplus$ | 0   | 1   |
| -------- | --- | --- |
| 0        | 0   | 1   |
| 1        | 1   | 0   |

We can use the same trick for `OR`, just once more, to make the `1 + 1` turn to a zero. What we have is equivalent to `in[0] + in[1] - 2 * AND(in)`.

## `NOT`

```cs
template NOT() {
  signal input in;
  signal output out;

  out <== 1 - in;
}
```

A `NOT` gate maps 0 to 1, and 1 to 0. We can achieve this by simply subtracting the signal from 1. Since $1 - 0 = 1$ and $1 - 1 = 0$.

## `NAND`

```cs
template NAND() {
  signal input in[2];
  signal output out;

  out <== 1 - in[0]*in[1];
}
```

`NAND` is equivalent to `NOT(AND(in))`, giving us the circuit above.

## `NOR`

```cs
template NOR() {
  signal input in[2];
  signal output out;

  out <== 1 - (in[0] + in[1] - in[0]*in[1]);
}
```

`NOR` is equivalent to `NOT(OR(in))`, giving us the circuit above.
