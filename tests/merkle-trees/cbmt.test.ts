import type { WitnessTester } from "circomkit";
import { poseidon1, poseidon2 } from "poseidon-lite";
import { circomkit } from "../common";
import { describe, it } from "bun:test";

// a complete binary Merkle tree as an array, in the same layout as a binary heap
function cbmt(leafs: bigint[]) {
  const N = leafs.length;
  const nodes: bigint[] = new Array(2 * N - 1);
  for (let i = 0; i < N; i++) nodes[N - 1 + i] = poseidon1([leafs[i]]);
  for (let i = N - 2; i >= 0; i--) nodes[i] = poseidon2([nodes[2 * i + 1], nodes[2 * i + 2]]);
  return nodes;
}

// the deepest level of the tree, i.e. `floor(log2(2N - 1))`
const depthOf = (N: number) => Math.floor(Math.log2(2 * N - 1));

// siblings of a leaf from the bottom to the top, padded with zeros
function proof(nodes: bigint[], N: number, index: number) {
  const siblings: bigint[] = [];
  for (let k = N - 1 + index; k > 0; k = (k - 1) >> 1) {
    siblings.push(nodes[k % 2 === 1 ? k + 1 : k - 1]);
  }
  while (siblings.length < depthOf(N)) siblings.push(0n);
  return siblings;
}

const randomLeafs = (N: number) => Array.from({ length: N }, () => BigInt(Math.floor(Math.random() * 1e15)));

const roots: Record<number, Promise<WitnessTester<["leafs"], ["root"]>>> = {};
const proofs: Record<number, Promise<WitnessTester<["leaf", "index", "siblings"], ["root"]>>> = {};
function rootCircuit(N: number) {
  roots[N] ??= circomkit.WitnessTester(`cbmt_${N}`, {
    file: "merkle-trees/cbmt",
    template: "CompleteBinaryMerkleTree",
    dir: "test/merkle-trees",
    params: [N],
  });
  return roots[N];
}
function proofCircuit(N: number) {
  proofs[N] ??= circomkit.WitnessTester(`cbmt_proof_${N}`, {
    file: "merkle-trees/cbmt",
    template: "CompleteBinaryMerkleProof",
    dir: "test/merkle-trees",
    params: [N],
  });
  return proofs[N];
}

describe("complete binary merkle tree", () => {
  const SIZES = [2, 3, 5, 6, 7, 8, 11];

  it("should compute the root", async () => {
    for (const N of SIZES) {
      const leafs = randomLeafs(N);
      await (await rootCircuit(N)).expectPass({ leafs }, { root: cbmt(leafs)[0] });
    }
  });

  it("should be the same as a binary Merkle tree for 2^n leaves", async () => {
    const leafs = randomLeafs(4);
    const bmt = await circomkit.WitnessTester<["leafs"], ["root"]>("bmt-2", {
      file: "merkle-trees/bmt",
      template: "BinaryMerkleTree",
      dir: "test/merkle-trees",
      params: [2],
    });
    await bmt.expectPass({ leafs }, { root: cbmt(leafs)[0] });
  });

  it("should verify a proof for every leaf", async () => {
    for (const N of SIZES) {
      const leafs = randomLeafs(N);
      const nodes = cbmt(leafs);
      const circuit = await proofCircuit(N);
      for (let index = 0; index < N; index++) {
        await circuit.expectPass({ leaf: leafs[index], index, siblings: proof(nodes, N, index) }, { root: nodes[0] });
      }
    }
  });

  it("should NOT accept an index outside of the leaves", async () => {
    const N = 5;
    const circuit = await proofCircuit(N);
    const nodes = cbmt(randomLeafs(N));
    // node 4 is a leaf, and would be "leaf" 5 if the index was not checked
    await circuit.expectFail({ leaf: 0, index: N, siblings: proof(nodes, N, 1) });
  });

  it("should NOT give the same root for a wrong leaf", async () => {
    const N = 6;
    const leafs = randomLeafs(N);
    const nodes = cbmt(leafs);
    const circuit = await proofCircuit(N);
    const { root } = await circuit.compute({ leaf: leafs[2] + 1n, index: 2, siblings: proof(nodes, N, 2) }, ["root"]);
    if (root === nodes[0]) throw new Error("wrong leaf gives the correct root");
  });
});
