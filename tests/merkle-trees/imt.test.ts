import type { WitnessTester } from "circomkit";
import { IMT, type IMTNode } from "@zk-kit/imt";
import { poseidon2 } from "poseidon-lite";
import { circomkit } from "../common";
import { describe, beforeAll, it, expect } from "bun:test";

const DEPTH = 4;
const ZERO = 0n;
const hash = (values: IMTNode[]) => poseidon2(values.map((v) => BigInt(v)));

describe("incremental merkle tree", () => {
  // zk-kit's binary Merkle tree with Poseidon, as used by Semaphore
  const newTree = () => new IMT(hash, DEPTH, ZERO, 2);

  describe("membership", () => {
    let circuit: WitnessTester<["leaf", "depth", "index", "siblings"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`imt_root_${DEPTH}`, {
        file: "merkle-trees/imt",
        template: "BinaryMerkleRoot",
        dir: "test/merkle-trees",
        params: [DEPTH],
      });
    });

    it("should compute the root from a membership proof", async () => {
      const tree = newTree();
      for (let i = 1n; i <= 5n; i++) tree.insert(i * 1000n);

      for (const index of [0, 2, 4]) {
        const proof = tree.createProof(index);
        await circuit.expectPass(
          { leaf: proof.leaf, depth: DEPTH, index, siblings: proof.siblings.map((s) => s[0]) },
          { out: tree.root },
        );
      }
    });
  });

  describe("insertion", () => {
    let circuit: WitnessTester<["oldRoot", "leaf", "index", "siblings"], ["newRoot"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`imt_insert_${DEPTH}`, {
        file: "merkle-trees/imt",
        template: "IncrementalMerkleTreeInsert",
        dir: "test/merkle-trees",
        params: [DEPTH, ZERO],
      });
    });

    // inserts a leaf into the tree, and returns the inputs for the circuit
    function insert(tree: IMT, leaf: bigint) {
      const [oldRoot, index] = [tree.root, tree.leaves.length];
      tree.insert(leaf);
      // the siblings of a leaf do not change when the leaf itself is updated
      const siblings = tree.createProof(index).siblings.map((s) => s[0]);
      return { oldRoot, leaf, index, siblings, newRoot: tree.root };
    }

    it("should prove insertions, from an empty tree to a full one", async () => {
      const tree = newTree();
      for (let i = 0; i < 2 ** DEPTH; i++) {
        const { newRoot, ...inputs } = insert(tree, BigInt(i + 1) * 7n);
        await circuit.expectPass(inputs, { newRoot });
      }
    });

    it("should NOT accept an insertion to a non-empty position", async () => {
      const tree = newTree();
      insert(tree, 111n);
      const { siblings } = insert(tree, 222n);

      // try to overwrite the leaf at index 1 with another value
      await circuit.expectFail({ oldRoot: tree.root, leaf: 333n, index: 1, siblings });
    });

    it("should NOT accept a wrong old root", async () => {
      const tree = newTree();
      insert(tree, 111n);
      const { oldRoot, newRoot, ...inputs } = insert(tree, 222n);
      await circuit.expectFail({ ...inputs, oldRoot: oldRoot + 1n });
    });

    it("should NOT accept an index outside of the tree", async () => {
      const tree = newTree();
      const { newRoot, ...inputs } = insert(tree, 111n);
      expect(inputs.index).toBe(0);
      // index 2^DEPTH has the same lower bits as index 0
      await circuit.expectFail({ ...inputs, index: 2 ** DEPTH });
    });
  });
});
