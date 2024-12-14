import { poseidon1, poseidon2 } from "poseidon-lite";
import { circomkit } from "../common";
import { describe, beforeAll, it } from "bun:test";

function binaryMerkleTree(leafs: bigint[]) {
  if (leafs.length === 0) {
    throw new Error("The number of leafs must be greater than 0");
  }

  const n = Math.ceil(Math.log2(leafs.length));
  if (1 << n !== leafs.length) {
    throw new Error("The number of leafs must be a power of 2 " + `${1 << n} != ${leafs.length}`);
  }

  const NUM_LEAVES = 1 << n;
  const NUM_NODES = (1 << (n + 1)) - 1;
  const nodes: bigint[] = new Array(NUM_NODES).fill(0n);

  // compute hashes of leaves
  for (let i = 0; i < NUM_LEAVES; i++) {
    nodes[NUM_NODES - 1 - i] = poseidon1([leafs[i]]);
  }

  // build the tree from the leaves to the root in reverse
  for (let i = NUM_NODES - NUM_LEAVES - 1; i >= 0; i--) {
    nodes[i] = poseidon2([nodes[2 * i + 1], nodes[2 * i + 2]]);
  }

  const root = nodes[0];
  return { leafs, nodes, root };
}

describe("binary merkle tree", () => {
  it("n = 1", async () => {
    const circuit = await circomkit.WitnessTester<["leafs"], ["root"]>("bmt-1", {
      file: "merkle-trees/bmt",
      template: "BinaryMerkleTree",
      dir: "test/merkle-trees",
      params: [1],
    });

    const leafs = [123n, 345n];
    const { root } = binaryMerkleTree(leafs);
    await circuit.expectPass({ leafs }, { root });
  });

  it("n = 2", async () => {
    const circuit = await circomkit.WitnessTester<["leafs"], ["root"]>("bmt-2", {
      file: "merkle-trees/bmt",
      template: "BinaryMerkleTree",
      dir: "test/merkle-trees",
      params: [2],
    });

    const leafs = [123n, 345n, 678n, 981n];
    const { root } = binaryMerkleTree(leafs);
    await circuit.expectPass({ leafs }, { root });
  });
});
