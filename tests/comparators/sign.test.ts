import type { WitnessTester } from "circomkit";
import { circomkit, primes, toBinary } from "../common";

describe("sign", () => {
  let circuit: WitnessTester<["in"], ["out"]>;
  const p = primes.bn128;
  const half = p >> 1n;

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`sign`, {
      file: "comparators/sign",
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
