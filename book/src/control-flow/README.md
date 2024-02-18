# Control Flow

In the world of arithmetic circuits, control flow is a bit different than what most developers are used to. In normal programming, only one of the branches are executed:

```c
if (cond) {
  foo(); // only if cond == true
} else {
  bar(); // only if cond == false
}
```

That is not how things work in our circuits! Instead, both branches are executed but only one of them is "returned".

To understand why, first remind yourself that we are ALWAYS working with integers in our circuits. Both `foo()` and `bar()` will return an integer, and `cond` is either 0 or 1. The trick is to combine these results with `cond` and `NOT(cond)` in a simple sum expression:

```c
cond*foo() + NOT(cond)*bar();
```

Opening this up, we have:

```c
cond*foo() + (1-cond)*bar();
```

In fact, we can use one multiplication instead of two, using the following form:

```c
cond*(foo() - bar()) + bar();
```

## `IfElse`

```cs
template IfElse() {
  signal input cond;
  signal input ifTrue;
  signal input ifFalse;
  signal output out;

  out <== cond * (ifTrue - ifFalse) + ifFalse;
}
```

Following our description above, an `if-else` is defined by the given circuit. Remember that both `ifTrue` and `ifFalse` signals are computed, regardless of the condition, but only one of them is returned.

### Conditional Constraints

In your application, there may be cases where `ifTrue` and `ifFalse` can't be valid at the same time, due to some condition; `ifTrue` might constrain a signal to be 0 but `ifFalse` might constrain that same signal to something else.

In these cases, we may add an auxillary signal which can enable/disable a constraint check. As an example, imagine the following template that constraints a signal to be 5:

```cs
template IsFive() {
  signal input in;

  in - 5 === 0;
}
```

We can add an auxillary `isEnabled` signal that is either 0 or 1, and disable this circuit when `isEnabled = 0` as follows:

```cs
template IsFive() {
  signal input in;
  signal input isEnabled;

  isEnabled * (in - 5) === 0;
}
```

If `isEnabled = 1` both circuits are equivalent, but if `isEnabled = 0` this circuit will always have `0 === 0` regardless of the `in` signal.

> Circomlib has a circuit that makes use of this trick, see [`ForceEqualIfEnabled`](https://github.com/iden3/circomlib/blob/master/circuits/comparators.circom).

## `Switch`

```cs
template Switch() {
  signal input cond;
  signal input in[2];
  signal output out[2];

  out[0] <== cond * (in[1] - in[0]) + in[0];
  out[1] <== cond * (in[0] - in[1]) + in[1];
}
```

It is often useful to switch the places of two signals based on a condition, which can be achieved with two `IfElse` lines together.

> You can do this with a single multiplication too!
>
> ```cs
> template Switch() {
>   signal input cond;
>   signal input in[2];
>   signal output out[2];
>
>   signal aux <== (in[1] - in[0]) * cond;
>
>   out[0] <==  aux + in[0];
>   out[1] <== -aux + in[1];
> }
> ```
