import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";

describe("bits", () => {
  const N = 5;
  const NUM = 11;
  const BITS = [1, 1, 0, 1, 0];

  describe("number to bits", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`num2bits_${N}`, {
        file: "bits/index",
        template: "Num2Bits",
        dir: "test/bits",
        params: [N],
      });
    });

    it("should pass for correct input & output", async () => {
      await circuit.expectPass({ in: NUM }, { out: BITS });
    });
  });

  describe("bits to number", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`bits2num_${N}`, {
        file: "bits/index",
        template: "Bits2Num",
        dir: "test/bits",
        params: [N],
      });
    });

    it("should pass for correct input & output", async () => {
      await circuit.expectPass({ in: BITS }, { out: NUM });
    });
  });
});
