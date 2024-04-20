import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";
import { describe, beforeAll, it } from "bun:test";

describe("sorted", () => {
  const N = 10;
  const B = 16; // 16-bits
  const sorted = Array.from({ length: N }, (_, i) => i);
  const notSorted = Array.from({ length: N }, (_, i) => N - i);

  describe("is sorted", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`arr_is_sorted_${N}_${B}`, {
        file: "arrays/sorted",
        template: "IsSorted",
        dir: "test/arrays",
        params: [N, B],
      });
    });

    it("should return 1 for sorted array", async () => {
      await circuit.expectPass({ in: sorted }, { out: 1 });
    });

    it("should return 0 for not sorted array", async () => {
      await circuit.expectPass({ in: notSorted }, { out: 0 });
    });
  });

  describe("assert sorted", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`arr_assert_sorted_${N}_${B}`, {
        file: "arrays/sorted",
        template: "AssertSorted",
        dir: "test/arrays",
        params: [N, B],
      });
    });

    it("should pass for sorted array", async () => {
      await circuit.expectPass({ in: sorted });
    });

    it("should fail for not sorted array", async () => {
      await circuit.expectFail({ in: notSorted });
    });
  });
});
