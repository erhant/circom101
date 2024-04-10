import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";

describe("sorted", () => {
  const N = 10;
  const B = 16; // 16-bits

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
      const sorted = Array.from({ length: N }, (_, i) => i);
      await circuit.expectPass({ in: sorted }, { out: 1 });
    });

    it("should return 0 for not sorted array", async () => {
      const notSorted = Array.from({ length: N }, (_, i) => N - i);
      await circuit.expectPass({ in: notSorted }, { out: 0 });
    });
  });
});
