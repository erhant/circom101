import type { WitnessTester } from "circomkit";
import { circomkit, primes } from "../../common";
import { describe, beforeAll, it } from "bun:test";

const N = 32; // bits per number, including the sign
const F = 16; // fractional bits

// fixed-point numbers as field elements, with negatives as `p - x`
const toFixed = (x: number) => BigInt(Math.round(x * 2 ** F));
const toField = (x: bigint) => (x < 0n ? primes.bn128 + x : x);
const floorDiv = (a: bigint, b: bigint) => (a >= 0n ? a / b : -((-a + b - 1n) / b));
const mul = (a: bigint, b: bigint) => floorDiv(a * b, 1n << BigInt(F));

describe("fixed-point", () => {
  describe("multiplication", () => {
    let circuit: WitnessTester<["in"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`fixed_mul_${N}_${F}`, {
        file: "examples/intermediate/fixed-point",
        template: "FixedPointMul",
        dir: "test/examples/intermediate",
        params: [N, F],
      });
    });

    it("should multiply numbers of any sign", async () => {
      for (const [a, b] of [
        [1.5, 2.25],
        [-1.5, 2.25],
        [-0.75, -3.5],
        [3.14159, 0],
        [0.001, 0.001], // rounds down to 0
        [-0.001, 0.001], // rounds down to -2^-16
      ]) {
        const [x, y] = [toFixed(a), toFixed(b)];
        await circuit.expectPass({ in: [x, y].map(toField) }, { out: toField(mul(x, y)) });
      }
    });

    it("should multiply the extreme values", async () => {
      const [min, max] = [-(1n << BigInt(N - 1)), (1n << BigInt(N - 1)) - 1n];
      for (const [x, y] of [
        [min, min], // the largest product
        [min, max],
        [max, max],
      ]) {
        await circuit.expectPass({ in: [x, y].map(toField) }, { out: toField(mul(x, y)) });
      }
    });

    it("should NOT accept numbers out of range", async () => {
      const one = toFixed(1);
      await circuit.expectFail({ in: [1n << BigInt(N - 1), one] });
      await circuit.expectFail({ in: [toField(-(1n << BigInt(N - 1)) - 1n), one] });
    });
  });

  describe("dot product", () => {
    const n = 4;
    let circuit: WitnessTester<["a", "b"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`fixed_dot_${n}_${N}_${F}`, {
        file: "examples/intermediate/fixed-point",
        template: "FixedPointDot",
        dir: "test/examples/intermediate",
        params: [n, N, F],
      });
    });

    it("should compute a dot product", async () => {
      for (let t = 0; t < 5; t++) {
        const a = Array.from({ length: n }, () => toFixed((Math.random() - 0.5) * 100));
        const b = Array.from({ length: n }, () => toFixed((Math.random() - 0.5) * 100));
        const sum = a.reduce((acc, x, i) => acc + x * b[i], 0n);
        const out = floorDiv(sum, 1n << BigInt(F));
        await circuit.expectPass({ a: a.map(toField), b: b.map(toField) }, { out: toField(out) });
      }
    });

    it("should compute the largest dot product", async () => {
      const min = -(1n << BigInt(N - 1));
      const a = Array(n).fill(min);
      const out = floorDiv(BigInt(n) * min * min, 1n << BigInt(F));
      await circuit.expectPass({ a: a.map(toField), b: a.map(toField) }, { out: toField(out) });
    });
  });
});
