import type { WitnessTester } from "circomkit";
import { newMemEmptyTrie } from "circomlibjs";
import { circomkit } from "../common";
import { describe, beforeAll, it, expect } from "bun:test";

const LEVELS = 10;

type SMT = Awaited<ReturnType<typeof newMemEmptyTrie>>;

// a tree with keys that share some of their lowest bits, so that the paths are of different lengths
const KEYS = [8n, 9n, 32n, 7n, 3n, 120n];
const value = (key: bigint) => key * 1000n + 1n;

async function newTree() {
  const tree = await newMemEmptyTrie();
  for (const key of KEYS) await tree.insert(key, value(key));
  return tree;
}

// convert siblings to bigints, and pad them with zeros up to `LEVELS`
function pad(tree: SMT, siblings: unknown[]) {
  const padded = siblings.map((s) => tree.F.toObject(s) as bigint);
  while (padded.length < LEVELS) padded.push(0n);
  return padded;
}

describe("sparse merkle tree", () => {
  describe("verifier", () => {
    let circuit: WitnessTester<
      ["enabled", "fnc", "root", "siblings", "oldKey", "oldValue", "isOld0", "key", "value"]
    >;
    let tree: SMT;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`smt_verifier_${LEVELS}`, {
        file: "merkle-trees/smt",
        template: "SMTVerifier",
        dir: "test/merkle-trees",
        params: [LEVELS],
      });
      tree = await newTree();
    });

    // inputs for an inclusion proof (fnc = 0)
    async function inclusion(key: bigint) {
      const res = await tree.find(key);
      expect(res.found).toBe(true);
      return {
        enabled: 1,
        fnc: 0,
        root: tree.F.toObject(tree.root),
        siblings: pad(tree, res.siblings),
        oldKey: 0,
        oldValue: 0,
        isOld0: 0,
        key,
        value: tree.F.toObject(res.foundValue),
      };
    }

    // inputs for an exclusion proof (fnc = 1)
    async function exclusion(key: bigint) {
      const res = await tree.find(key);
      expect(res.found).toBe(false);
      return {
        enabled: 1,
        fnc: 1,
        root: tree.F.toObject(tree.root),
        siblings: pad(tree, res.siblings),
        oldKey: res.isOld0 ? 0 : tree.F.toObject(res.notFoundKey),
        oldValue: res.isOld0 ? 0 : tree.F.toObject(res.notFoundValue),
        isOld0: res.isOld0 ? 1 : 0,
        key,
        value: 0,
      };
    }

    it("should prove that keys are in the tree", async () => {
      for (const key of KEYS) {
        await circuit.expectPass(await inclusion(key));
      }
    });

    it("should prove that keys are not in the tree", async () => {
      const isOld0: number[] = [];
      for (const key of [0n, 1n, 2n, 10n, 40n, 1023n]) {
        const input = await exclusion(key);
        isOld0.push(input.isOld0);
        await circuit.expectPass(input);
      }
      // both kinds of exclusion proofs are covered: an empty spot, and a spot with another leaf
      expect(isOld0).toContain(0);
      expect(isOld0).toContain(1);
    });

    it("should NOT accept a wrong value", async () => {
      const input = await inclusion(KEYS[0]);
      await circuit.expectFail({ ...input, value: input.value + 1n });
    });

    it("should NOT accept an inclusion proof for a missing key", async () => {
      const input = await exclusion(10n);
      await circuit.expectFail({ ...input, fnc: 0, value: 1 });
    });

    it("should NOT accept an exclusion proof for an existing key", async () => {
      // pretend that the leaf at the key's position is "another" leaf with the same key
      const input = await inclusion(KEYS[0]);
      await circuit.expectFail({ ...input, fnc: 1, oldKey: input.key, oldValue: input.value, value: 0 });
    });
  });

  describe("processor", () => {
    let circuit: WitnessTester<
      ["fnc", "oldRoot", "siblings", "oldKey", "oldValue", "isOld0", "newKey", "newValue"],
      ["newRoot"]
    >;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`smt_processor_${LEVELS}`, {
        file: "merkle-trees/smt",
        template: "SMTProcessor",
        dir: "test/merkle-trees",
        params: [LEVELS],
      });
    });

    it("should prove insertions", async () => {
      const tree = await newMemEmptyTrie();
      for (const key of KEYS) {
        const res = await tree.insert(key, value(key));
        await circuit.expectPass(
          {
            fnc: [1, 0],
            oldRoot: tree.F.toObject(res.oldRoot),
            siblings: pad(tree, res.siblings),
            oldKey: res.isOld0 ? 0 : tree.F.toObject(res.oldKey),
            oldValue: res.isOld0 ? 0 : tree.F.toObject(res.oldValue),
            isOld0: res.isOld0 ? 1 : 0,
            newKey: key,
            newValue: value(key),
          },
          { newRoot: tree.F.toObject(res.newRoot) },
        );
      }
    });

    it("should prove updates", async () => {
      const tree = await newTree();
      for (const key of KEYS) {
        const res = await tree.update(key, 42n);
        await circuit.expectPass(
          {
            fnc: [0, 1],
            oldRoot: tree.F.toObject(res.oldRoot),
            siblings: pad(tree, res.siblings),
            oldKey: tree.F.toObject(res.oldKey),
            oldValue: tree.F.toObject(res.oldValue),
            isOld0: 0,
            newKey: tree.F.toObject(res.newKey),
            newValue: tree.F.toObject(res.newValue),
          },
          { newRoot: tree.F.toObject(res.newRoot) },
        );
      }
    });

    it("should prove deletions", async () => {
      const tree = await newTree();
      for (const key of KEYS) {
        const res = await tree.delete(key);
        await circuit.expectPass(
          {
            fnc: [1, 1],
            oldRoot: tree.F.toObject(res.oldRoot),
            siblings: pad(tree, res.siblings),
            oldKey: res.isOld0 ? 0 : tree.F.toObject(res.oldKey),
            oldValue: res.isOld0 ? 0 : tree.F.toObject(res.oldValue),
            isOld0: res.isOld0 ? 1 : 0,
            newKey: tree.F.toObject(res.delKey),
            newValue: tree.F.toObject(res.delValue),
          },
          { newRoot: tree.F.toObject(res.newRoot) },
        );
      }
      // the tree is empty after deleting all keys
      expect(tree.F.toObject(tree.root)).toBe(0n);
    });
  });
});
