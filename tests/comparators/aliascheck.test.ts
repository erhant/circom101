import type { WitnessTester } from "circomkit";
import { circomkit, primes, toBinary } from "../common";

describe("alias check", () => {
  let circuit: WitnessTester<["in"]>;
  const p = primes.bn128;

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`aliascheck`, {
      file: "comparators/aliascheck",
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
