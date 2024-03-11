# `Adder`

```cs
template Adder(n) {
  signal input in[n];
  signal output out;

  var lc = 0;
  for (var i = 0; i < n; i++) {
    lc += in[i];
  }
  out <== lc;
}
```

Adding an array of values and returning the sum is a common operation within circuits.

$$
\texttt{sum} = \sum_{i=0}^{n-1}a_i
$$

No matter how large $n$ is, a sum operation is just a single linear constraint! Formally, for an array $\vec{a} = [a_0, a_1, \ldots, a_{n-1}]$ with sum $s$ the following is a valid rank-1 constraint:

$$
1 \cdot (s) = (a_0 + a_1 + \ldots + a_{n-1})
$$

The variable `lc` within the code stands for "linear combination" and its just a variable that stores the expression on the right hand-side in equation above:

```py
lc = in[0] + in[1] + ... + in[n-1]
```
