import type { WitnessTester } from "circomkit";
import { circomkit } from "./common";
import { fibonacci } from "./utilities/fibonacci";

const N = 7;

describe("fibonacci", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester(`fibonacci_${N}`, {
      file: "fibonacci",
      template: "Fibonacci",
      params: [N],
    });
    console.log("#constraints:", await circuit.getConstraintCount());
  });

  it("should compute correctly", async () => {
    await circuit.expectPass({ in: [1, 1] }, { out: fibonacci([1, 1], N) });
  });
});

describe("fibonacci recursive", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester(`fibonacci_${N}_recursive`, {
      file: "fibonacci",
      template: "FibonacciRecursive",
      params: [N],
    });
    console.log("#constraints:", await circuit.getConstraintCount());
  });

  it("should compute correctly", async () => {
    await circuit.expectPass({ in: [1, 1] }, { out: fibonacci([1, 1], N) });
  });
});
