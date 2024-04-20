import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";
import { describe, beforeAll, it } from "bun:test";

describe("range", () => {
  const [MIN, MAX] = [1, 9];
  let circuit: WitnessTester<["in"]>;

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`inRange_${MIN}_${MAX}`, {
      file: "comparators/range",
      template: "AssertInRange",
      dir: "test/comparators",
      params: [MIN, MAX],
    });
  });

  it("should pass for in range", async () => {
    await circuit.expectPass({ in: MAX });
    await circuit.expectPass({ in: MIN });
    await circuit.expectPass({ in: Math.floor((MIN + MAX) / 2) });
  });

  it("should fail for out of range (upper bound)", async () => {
    await circuit.expectFail({ in: MAX + 1 });
  });

  it("should fail for out of range (lower bound)", async () => {
    await circuit.expectFail({ in: Math.max(MIN, 1) - 1 });
  });
});
