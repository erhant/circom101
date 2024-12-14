# Sparse Merkle Tree

What if we don't even know the size of the tree in advance? This is where **Sparse Merkle Trees** come in. It is like an [**Incremential Merkle Tree**](./imt.md) in the sense that we can update the tree by adding / removing nodes, but in the case of a Sparse Merkle Tree the size of the tree is not known ahead of time!

A Sparse Merkle Tree allow us to create Merkle Trees where the leaf nodes are not entirely filled, and one can create either an inclusion proof or exclusion proof for an element in the tree without revealing the entire tree.

- **Inclusion proof** shows that an element is in the tree, as we discussed while describing Merkle Trees.
- **Exclusion proof** shows that an element is NOT in the tree. This is possible with a Sparse Merkle Tree because nodes

## See Also

- [Tochicool's SMT](https://github.com/tochicool/sparse-merkle-trees#readme)
- [Efficient Sparse Merkle Trees](https://eprint.iacr.org/2016/683.pdf) by Rasmus Dahlberg, Tobias Pulls, and Roel Peeters.
- Iden3 (authors of Circom) has a nice publication on Merkle Trees: [Sparse Merkle Trees](https://docs.iden3.io/publications/pdfs/Merkle-Tree.pdf) by Jordi Baylina and Marta Belles.
