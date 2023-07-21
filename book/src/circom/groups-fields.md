# Groups & Finite Fields

Suppose you have some well-defined objects and a well-defined interaction for these elements, you have a group! This set of objects is called, a **set**. You've probably came across a set during your early education, remember Venn diagrams and such?

Then, you define an operation over the elements of this set. Here is an example: our set has two elements, 0 and 1. The operation is to add them together. Let's what happens when we do that:

```c
/* add */
0 + 0 = 0
0 + 1 = 1
1 + 0 = 1
1 + 1 = 0
```

Looks fine, except why did we get 1+1=0 instead of 1+1=2? Well, we could very well have 1+1=2 but our group did not have 2 in it, and we would really like our operation to result in some element that is also a member of this group.

We can thus define our operation as "addition modulo 2" instead of just being "addition", this way the result of that operation would still be an element of our group, which comes in handy in various ways. You might also notice that defining the operation to be an exclusive-OR (XOR) would also look like the above.

We are working with numbers indeed, but it's important to keep an open mind about groups and operations. You could literally define something like:

```c
/*  add  */
🍏 + 🍏 = 🍏
🍏 + 🍎 = 🍎
🍎 + 🍏 = 🍎
🍎 + 🍎 = 🍏
```

It is indeed a group of apples 🍏🍎.

## Finite Field

A finite field is like a group we described above, it has some operations defined over some elements. In particular, a field has addition, multiplication, subtraction (making use of _additive inverse_), and division (making use of _multiplicative inverse_) defined over its elements. What makes it "finite" is, well, that it has finitely many elements.

Remember the example above with two elements? That can actually be a finite field too! In fact, that would be the field with the smallest number of elements: having a neutral element in addition and multiplication (0 and 1 respectively). Addition and multiplication both happen in modulo 2.

```c
/* add */             /* mul */
0 + 0 = 0             0 * 0 = 0
0 + 1 = 1             0 * 1 = 0
1 + 0 = 1             1 * 0 = 0
1 + 1 = 0             1 * 1 = 1
```

Circom uses much larger finite fields, and these depend on the elliptic curve that is being used in the background. For example, Circom supports the alt_bn128 elliptic curve, which has a finite field of order:

```c
21888242871839275222246405745257275088548364400416034343698204186575808495617
```
