# Multiplexing

Multiplexing is a technique to select one of many signals based on a control signal. It is often used to switch between different signals or to select a signal based on a condition.

## `Mux1`

```cs
template Mux1() {
  signal input in[2];
  signal input sel;
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

`Mux2` is a 2-bit multiplexer, which means it can select one of four inputs based on two control signals. The arithmetic above may look weird, but its actually simple to derive. Just think of the `sel` cases in order (note that the bits are in little-endian):

- `sel = [0, 0]`: You need `in[0]` here, and since `sel` multiplications will be 0, you need `in[0]` added by default.
- `sel = [1, 0]`: You need `in[1]`, but `in[0]` was added already as a constant so you need `in[1] - in[0]` in total.
- `sel = [0, 1]`: Similar to the previous case, you need `in[2]`, but `in[0]` was added already as a constant so you need `in[2] - in[0]` in total.
- `sel = [1, 1]`: You need `in[3]`, but now we have all things from the previous cases added together, which is a total: `in[0] + (in[1] - in[0]) + (in[2] - in[0])`. We need to add `in[3]` and get rid of evertyhing else here, which gives us `in[3] - in[2] - in[1] + in[0]`.

> You can actually construct a `Mux2` using three `Mux1` circuits.
>
> ```cs
> template Mux2() {
>   signal input in[4];
>   signal input sel[2];
>   signal output out;
>
>   signal inA <== Mux1()([in[0], in[1]], sel[0]);
>   signal inB <== Mux1()([in[2], in[3]], sel[0]);
>   out <== Mux1()([inA, inB], sel[1]);
> }
> ```
>
> In fact, this has 3 non-linear constraints while the previous implementation has 4 non-linear constraints!

## Larger Multiplexers

There are larger multiplexing circuits, e.g. [`Mux3`](https://github.com/iden3/circomlib/blob/circomlib2/circuits/mux3.circom), [`Mux4`](https://github.com/iden3/circomlib/blob/circomlib2/circuits/mux4.circom), etc. but we will not cover them here. You can construct them with a similar approach as we did for `Mux2`, i.e. by using smaller multiplexers and combining them.
