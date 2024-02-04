import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";

const N = 14;

describe("fibonacci", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  before(async () => {
    circuit = await circomkit.WitnessTester(`fibonacci_${N}`, {
      file: "basics/fibonacci",
      template: "Fibonacci",
      dir: "test/basics",
      params: [N],
    });
    console.log("#constraints:", await circuit.getConstraintCount());
  });

  it("should return n'th fibonacci number", async () => {
    await circuit.expectPass({ in: [1, 1] }, { out: fibonacci([1, 1], N) });
  });
});

// simple fibonacci with 2 variables
function fibonacci(init: [number, number], n: number): number {
  if (n < 0) {
    throw new Error("N must be positive");
  }

  let [a, b] = init;
  for (let i = 2; i <= n; i++) {
    b = a + b;
    a = b - a;
  }
  return n === 0 ? a : b;
}
