import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";

describe("inverse", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`inverse`, {
      file: "arithmetic/inverse",
      template: "Inverse",
      dir: "test/arithmetic",
    });
  });

  it("should compute inverse correctly", async () => {
    const pairs = [
      [2, 10944121435919637611123202872628637544274182200208017171849102093287904247809n],
      [42, 15113310554365213843932042062201451846854823038382499903982093366921391580307n],
      [1337, 21560819642641978659460371253929567159026324544014896956357916913777367082070n],
    ] as [num: number, inv: bigint][];

    for (const pair of pairs) {
      await circuit.expectPass({ in: pair[0] }, { out: pair[1] });
    }
  });
});
