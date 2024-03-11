import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";

const N = 3;

describe("adder", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`adder_${N}`, {
      file: "arithmetic/adder",
      template: "Adder",
      dir: "test/arithmetic",
      params: [N],
    });
  });

  it("should sum correctly", async () => {
    const randomNumbers = Array.from({ length: N }, () => Math.floor(Math.random() * 100 * N));
    await circuit.expectPass({ in: randomNumbers }, { out: randomNumbers.reduce((prev, acc) => acc + prev) });
  });
});
