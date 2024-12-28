import { poseidon1, poseidon2 } from "poseidon-lite";
import { circomkit } from "../common";
import { describe, it } from "bun:test";

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
    nodes[NUM_NODES - 1 - i] = poseidon1([leafs[NUM_LEAVES - 1 - i]]);
  }

  // build the tree from the leaves to the root in reverse
  for (let i = NUM_NODES - NUM_LEAVES - 1; i >= 0; i--) {
    nodes[i] = poseidon2([nodes[2 * i + 1], nodes[2 * i + 2]]);
  }

  const root = nodes[0];
  return { leafs, nodes, root };
}

describe("binary merkle tree", () => {
  const [LEFT, RIGHT] = [1, 0] as const;

  describe("n = 1", () => {
    const leafs = [123n, 345n];
    const tree = binaryMerkleTree(leafs);

    it("should build the tree", async () => {
      const circuit = await circomkit.WitnessTester<["leafs"], ["root"]>("bmt-1-proof", {
        file: "merkle-trees/bmt",
        template: "BinaryMerkleTree",
        dir: "test/merkle-trees",
        params: [1],
      });

      await circuit.expectPass({ leafs }, { root: tree.root });
    });
  });

  describe("n = 2", () => {
    const leafs = [123n, 345n, 678n, 981n];
    const tree = binaryMerkleTree(leafs);

    it("should build the tree", async () => {
      const circuit = await circomkit.WitnessTester<["leafs"], ["root"]>("bmt-2", {
        file: "merkle-trees/bmt",
        template: "BinaryMerkleTree",
        dir: "test/merkle-trees",
        params: [2],
      });

      await circuit.expectPass({ leafs }, { root: tree.root });
    });

    it("should generate proof", async () => {
      const circuit = await circomkit.WitnessTester<["in", "siblings", "indices"], ["root"]>("bmt-2-proof", {
        file: "merkle-trees/bmt",
        template: "BinaryMerkleProof",
        dir: "test/merkle-trees",
        params: [2],
      });

      /**
       *          (0)
       *      <1>     (2)     right, node[1]
       *    3    4 (5)   <6>  left,  node[6]
       *            2 (index)
       */
      const [siblings, indices] = [
        [tree.nodes[1], tree.nodes[6]],
        [RIGHT, LEFT],
      ];
      await circuit.expectPass({ in: leafs[2], siblings, indices }, { root: tree.root });
    });
  });
});
