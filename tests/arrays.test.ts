import type { WitnessTester } from "circomkit";
import { circomkit } from "./common";

describe("arrays", () => {
  describe("distinct", () => {
    const N = 3;
    let circuit: WitnessTester<["in"]>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`distinct_${N}`, {
        file: "circuits/utils/arrays",
        template: "AssertDistinct",
        dir: "test/arrays",
        params: [N],
      });
    });

    it("should pass if all inputs are unique", async () => {
      await circuit.expectPass({
        in: Array(N)
          .fill(0)
          .map((_, i) => i),
      });
    });

    it("should fail if there is a duplicate", async () => {
      const arr = Array(N)
        .fill(0)
        .map((v, i) => v + i);
      // make a duplicate
      arr[0] = arr[arr.length - 1];
      await circuit.expectFail({
        in: arr,
      });
    });
  });
});
