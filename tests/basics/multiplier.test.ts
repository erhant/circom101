import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";

const N = 3;

describe("multiplier", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`multiplier_${N}`, {
      file: "basics/multiplier",
      template: "Multiplier",
      dir: "test/basics",
      params: [N],
    });
  });

  it("should have correct number of constraints", async () => {
    await circuit.expectConstraintCount(N - 1);
  });

  it("should multiply correctly", async () => {
    const randomNumbers = Array.from({ length: N }, () => Math.floor(Math.random() * 100 * N));
    await circuit.expectPass({ in: randomNumbers }, { out: randomNumbers.reduce((prev, acc) => acc * prev) });
  });
});
