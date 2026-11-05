import type { WitnessTester } from "circomkit";
import * as poseidon from "poseidon-lite";
import { circomkit, primes } from "../common";
import { describe, beforeAll, it } from "bun:test";

// `poseidon1`, `poseidon2`, ... from poseidon-lite, which matches Circomlib's `Poseidon`
const reference = (inputs: bigint[]) => (poseidon as any)[`poseidon${inputs.length}`](inputs) as bigint;

const randomField = () => BigInt(Math.floor(Math.random() * 2 ** 52)) ** 5n % primes.bn128;

[1, 2, 3, 5, 16].map((N) =>
  describe(`poseidon (${N} inputs)`, () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`poseidon_${N}`, {
        file: "hashing/poseidon",
        template: "PoseidonHash",
        dir: "test/hashing",
        params: [N],
      });
    });

    it("should match the reference implementation", async () => {
      for (let t = 0; t < 3; t++) {
        const inputs = Array.from({ length: N }, randomField);
        await circuit.expectPass({ in: inputs }, { out: reference(inputs) });
      }
    });

    it("should hash zeros", async () => {
      const inputs = Array.from({ length: N }, () => 0n);
      await circuit.expectPass({ in: inputs }, { out: reference(inputs) });
    });
  }),
);
