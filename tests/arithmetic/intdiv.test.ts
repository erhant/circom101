import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";

describe("integer division", () => {
  let circuit: WitnessTester<["in"], ["out"]>;
  const N = 16; // 16-bit integer division
  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`intdiv_${N}`, {
      file: "arithmetic/intdiv",
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
});
