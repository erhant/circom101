import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";
import { describe, beforeAll, it } from "bun:test";

describe("comparators", () => {
  describe("is zero", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`is_zero`, {
        file: "comparators/index",
        template: "IsZero",
        dir: "test/comparators",
      });
    });

    it("should return 1 for zero", async () => {
      await circuit.expectPass({ in: 0 }, { out: 1 });
    });

    it("should return 0 for non-zero values", async () => {
      await circuit.expectPass({ in: 1 }, { out: 0 });
      await circuit.expectPass({ in: 100 }, { out: 0 });
      await circuit.expectPass({ in: 100_000 }, { out: 0 });
    });
  });

  describe("is equal", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`is_equal`, {
        file: "comparators/index",
        template: "IsEqual",
        dir: "test/comparators",
      });
    });

    it("should return 1 for equal values", async () => {
      await circuit.expectPass({ in: [0, 0] }, { out: 1 });
      await circuit.expectPass({ in: [10, 10] }, { out: 1 });
    });

    it("should return 0 for non-equal values", async () => {
      await circuit.expectPass({ in: [10, 0] }, { out: 0 });
      await circuit.expectPass({ in: [0, 10] }, { out: 0 });
    });
  });
});
