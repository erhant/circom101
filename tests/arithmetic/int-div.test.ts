import type { WitnessTester } from "circomkit";
import { circomkit, primes } from "../common";
import { describe, beforeAll, it } from "bun:test";

describe("integer division", () => {
  let circuit: WitnessTester<["in"], ["out"]>;
  const N = 16; // 16-bit integer division
  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`intdiv_${N}`, {
      file: "arithmetic/int-div",
      template: "IntDiv",
      dir: "test/arithmetic",
      params: [N],
    });
  });

  it("should divide correctly", async () => {
    const MAX = 1000;
    for (let i = 0; i < 10; i++) {
      const [N, M] = [Math.round(Math.random() * MAX), Math.round(Math.random() * MAX) || 1];
      await circuit.expectPass({ in: [N, M] }, { out: Math.floor(N / M) });
    }
  });

  it("should return dividend when divisor is 1", async () => {
    const N = Math.round(Math.random() * 1000);
    await circuit.expectPass({ in: [N, 1] }, { out: N });
  });

  it("should return 1 when divisor is dividend", async () => {
    const N = Math.round(Math.random() * 1000);
    await circuit.expectPass({ in: [N, N] }, { out: 1 });
  });

  it("should return 0 when dividend is zero", async () => {
    const M = Math.round(Math.random() * 1000);
    await circuit.expectPass({ in: [0, M] }, { out: 0 });
  });

  it("should NOT accept a forged quotient with a negative remainder", async () => {
    // 10 = 4 * 3 + (-2), so a dishonest prover claims 10 / 3 = 4
    const [a, b, q, r] = [10n, 3n, 4n, primes.bn128 - 2n];

    // `LessThan` computes 2^N + r - b, which is a N-bit value for r = -2,
    // so it would say that r < b if `r` is not range-checked
    const lt = (1n << BigInt(N)) + r - b - primes.bn128;
    const edits: Record<string, bigint> = { "main.out": q, "main.rem": r, "main.remIsLess.toBits.in": lt };
    for (let i = 0; i <= N; i++) {
      edits[`main.remIsLess.toBits.out[${i}]`] = (lt >> BigInt(i)) & 1n;
    }

    const witness = await circuit.calculateWitness({ in: [a, b] });
    await circuit.expectConstraintFail(await circuit.editWitness(witness, edits));
  });
});
