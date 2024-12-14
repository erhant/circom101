# Multiplexing

Multiplexing is a technique to select one of many signals based on a control signal. It is often used to switch between different signals or to select a signal based on a condition.

## `Mux1`

```cs
template Mux1() {
  signal input  in[2];
  signal input  sel;
  signal output out;

  out <== (in[1] - in[0]) * sel + in[0];
}
```

`Mux1` is actually the same circuit as `IfElse` we defined in this section. Its just that the naming is a bit different, such that it is generalizable to higher multiplexers.

- `in[0]` is `ifFalse`
- `in[1]` is `ifTrue`
- `sel` is `cond`
- `out` is `out`

The main idea here is that `in` has number of values equal to the number of bits of `sel`, and `out = in[sel]`.

To compute this expression, on can construct the truth table and then its corresponding boolean expression. The truth table for `Mux1` is:

| sel | out     |
| --- | ------- |
| 0   | `in[0]` |
| 1   | `in[1]` |

## `Mux2`

```cs
template Mux2() {
  signal input in[4];
  signal input sel[2];
  signal output out;

  // due to multiplication we need an auxiliary signal
  signal sel_0_sel_1 <== sel[1] * sel[0];

  signal a11 <== (in[3] - in[2] - in[1] + in[0]) * sel_0_sel_1;
  signal a10 <== (in[2] - in[0]) * sel[1];
  signal a01 <== (in[1] - in[0]) * sel[0];
  signal a00 <== in[0];

  out <== (a11 + a10 + a01 + a00);
}
```

One can actually construct a `Mux2` using three `Mux1` circuits.

- `inA <== Mux1(in[0], in[1], sel[0])`
- `inB <== Mux1(in[2], in[3], sel[0])`
- `out <== Mux1(inA,   inB,   sel[1])`

## Larger Multiplexers

There are larger multiplexing circuits, e.g. [`Mux3`](https://github.com/iden3/circomlib/blob/circomlib2/circuits/mux3.circom), [`Mux4`](https://github.com/iden3/circomlib/blob/circomlib2/circuits/mux4.circom), etc. but we will not cover them here.
