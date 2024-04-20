import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";
import { describe, beforeAll, it, expect } from "bun:test";

describe("bits", () => {
  const N = 5;
  const NUM = 11;
  const BITS = [1, 1, 0, 1, 0];

  describe("bits function", () => {
    function nbits(n: number) {
      let ans = 0;
      let tmp = 1;
      while (tmp - 1 < n) {
        ans++;
        tmp <<= 1;
      }
      return ans;
    }

    it("should compute minimum number of bits correctly", () => {
      expect(nbits(0)).toBe(0);
      expect(nbits(1)).toBe(1);
      expect(nbits(2)).toBe(2);
      expect(nbits(3)).toBe(2);
      expect(nbits(4)).toBe(3);
      expect(nbits(7)).toBe(3);
      expect(nbits(8)).toBe(4);
    });
  });

  describe("number to bits", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    beforeAll(async () => {
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

    beforeAll(async () => {
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
