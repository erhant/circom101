import type { WitnessTester } from "circomkit";
import { circomkit, primes, toBinary } from "../common";

describe("constant", () => {
  describe("compconstant", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    const CONSTANT = Math.round(Math.random() * 10000);

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`compconstant`, {
        file: "comparators/constant",
        template: "CompConstant",
        dir: "test/comparators",
        params: [CONSTANT],
      });
    });

    it("should return 0 when `in` < constant", async () => {
      await circuit.expectPass({ in: toBinary(CONSTANT - 1) }, { out: 0 });
    });

    it("should return 0 when `in` == constant", async () => {
      await circuit.expectPass({ in: toBinary(CONSTANT) }, { out: 0 });
    });

    it("should return 1 when `in` > constant", async () => {
      await circuit.expectPass({ in: toBinary(CONSTANT + 1) }, { out: 1 });
    });
  });

  describe("alias check", () => {
    let circuit: WitnessTester<["in"]>;
    const p = primes.bn128;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`aliascheck`, {
        file: "comparators/constant",
        template: "AliasCheck",
        dir: "test/comparators",
      });
    });

    it("should pass for n < p", async () => {
      const bits = toBinary(p - 1n);
      expect(bits.length).toBe(254);
      await circuit.expectPass({ in: bits });
    });

    it("should fail for n == p", async () => {
      const bits = toBinary(p);
      expect(bits.length).toBe(254);
      await circuit.expectFail({ in: bits });
    });

    it("should fail for n > p", async () => {
      const bits = toBinary(p + 1n);
      expect(bits.length).toBe(254);
      await circuit.expectFail({ in: bits });
    });
  });

  describe("sign", () => {
    let circuit: WitnessTester<["in"], ["out"]>;
    const p = primes.bn128;
    const half = p >> 1n;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`sign`, {
        file: "comparators/constant",
        template: "Sign",
        dir: "test/comparators",
      });
    });

    it("should return 0 for positives (n < p / 2)", async () => {
      const bits = toBinary(half - 1n);
      expect(bits.length).toBe(254);
      await circuit.expectPass({ in: bits }, { out: 0 });
    });

    it("should return 0 for positives (n == p / 2)", async () => {
      const bits = toBinary(half);
      expect(bits.length).toBe(254);
      await circuit.expectPass({ in: bits }, { out: 0 });
    });

    it("should return 1 for negatives (n > p / 2)", async () => {
      const bits = toBinary(half + 1n);
      expect(bits.length).toBe(254);
      await circuit.expectPass({ in: bits }, { out: 1 });
    });
  });
});
