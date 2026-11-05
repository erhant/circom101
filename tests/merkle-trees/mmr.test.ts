import type { WitnessTester } from "circomkit";
import MMR from "@accumulators/merkle-mountain-range";
import MemoryStore from "@accumulators/memory";
import { PoseidonHasher } from "@accumulators/hashers";
import { circomkit } from "../common";
import { describe, beforeAll, it, expect } from "bun:test";

const B = 5; // up to 31 leaves

const hex = (x: bigint) => `0x${x.toString(16)}`;
const randomLeaf = () => BigInt(Math.floor(Math.random() * 1e15));

// HerodotusDev's MMR with Circomlib's Poseidon
async function newMMR(leafs: bigint[]) {
  const mmr = new MMR(new MemoryStore(), await PoseidonHasher.create());
  for (const leaf of leafs) await mmr.append(hex(leaf));
  return mmr;
}

// inputs to the circuit for the leaf at `index`
async function proofInputs(mmr: MMR, leafs: bigint[], index: number) {
  const proof = await mmr.getProof(MMR.mapLeafIndexToElementIndex(index));
  expect(await mmr.verifyProof(proof, hex(leafs[index]))).toBe(true);

  const siblings = proof.siblingsHashes.map(BigInt);
  while (siblings.length < B - 1) siblings.push(0n);
  const peaks = proof.peaksHashes.map(BigInt);
  while (peaks.length < B) peaks.push(0n);

  return { leaf: leafs[index], index, leafCount: leafs.length, siblings, peaks };
}

describe("merkle mountain range", () => {
  let circuit: WitnessTester<["leaf", "index", "leafCount", "siblings", "peaks"], ["root"]>;

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`mmr_proof_${B}`, {
      file: "merkle-trees/mmr",
      template: "MerkleMountainRangeProof",
      dir: "test/merkle-trees",
      params: [B],
    });
  });

  it("should verify a proof for every leaf", async () => {
    for (const leafCount of [1, 2, 3, 4, 5, 6, 7, 8, 11, 31]) {
      const leafs = Array.from({ length: leafCount }, randomLeaf);
      const mmr = await newMMR(leafs);
      const root = BigInt((await mmr.rootHash.get())!);
      for (let index = 0; index < leafCount; index++) {
        await circuit.expectPass(await proofInputs(mmr, leafs, index), { root });
      }
    }
  });

  describe("invalid proofs", () => {
    const leafs = Array.from({ length: 11 }, randomLeaf);
    let mmr: MMR;
    beforeAll(async () => {
      mmr = await newMMR(leafs);
    });

    it("should NOT accept an index outside of the leaves", async () => {
      const inputs = await proofInputs(mmr, leafs, 10);
      await circuit.expectFail({ ...inputs, index: 11 });
    });

    it("should NOT accept a wrong leaf", async () => {
      const inputs = await proofInputs(mmr, leafs, 3);
      await circuit.expectFail({ ...inputs, leaf: inputs.leaf + 1n });
    });

    it("should NOT accept a proof against the wrong peak", async () => {
      // 11 = 8 + 2 + 1, so leaf 9 is in the second mountain; swap the first two peaks
      const inputs = await proofInputs(mmr, leafs, 9);
      const [p0, p1, ...rest] = inputs.peaks;
      await circuit.expectFail({ ...inputs, peaks: [p1, p0, ...rest] });
    });

    it("should NOT give the same root for a different leaf count", async () => {
      // with 12 leaves, the first 8 leaves are still in the same mountain
      const inputs = await proofInputs(mmr, leafs, 0);
      const root = BigInt((await mmr.rootHash.get())!);
      const { root: other } = await circuit.compute({ ...inputs, leafCount: 12 }, ["root"]);
      expect(other).not.toBe(root);
    });
  });
});
