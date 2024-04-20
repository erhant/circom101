import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";
import { describe, beforeAll, it } from "bun:test";

describe("distinct", () => {
  const N = 3;
  // arr = [0, 1, 2, 3, 4, 5, ...]
  const distinctArr = Array.from({ length: N }, (_, i) => i);
  // arr = [0, 0, 1, 1, 2, 2, ...]
  const notDistinctArr = Array.from({ length: N }, (_, i) => i >> 1);

  describe("assert distinct", () => {
    let circuit: WitnessTester<["in"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`distinct_${N}`, {
        file: "arrays/distinct",
        template: "AssertDistinct",
        dir: "test/arrays",
        params: [N],
      });
    });

    it("should pass if all inputs are unique", async () => {
      await circuit.expectPass({ in: distinctArr });
    });

    it("should fail if there is a duplicate", async () => {
      await circuit.expectFail({ in: notDistinctArr });
    });
  });

  describe("is distinct", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`is_distinct_${N}`, {
        file: "arrays/distinct",
        template: "IsDistinct",
        dir: "test/arrays",
        params: [N],
      });
    });

    it("should return 1 if all inputs are unique", async () => {
      await circuit.expectPass({ in: distinctArr }, { out: 1 });
    });

    it("should return 0 if there is a duplicate", async () => {
      await circuit.expectPass({ in: notDistinctArr }, { out: 0 });
    });
  });
});
