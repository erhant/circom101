import type { WitnessTester } from "circomkit";
import { circomkit } from "./common";
import { MAGIC_SIZES, MAGIC_INPUTS } from "./data/magic";

MAGIC_SIZES.map((N) =>
  describe(`magic (${N} by ${N})`, () => {
    const INPUT = MAGIC_INPUTS[N];
    const OUTPUT = {
      sum: INPUT.in[0].reduce((acc: number, cur: number) => acc + cur, 0),
    };
    let circuit: WitnessTester<["in"], ["sum"]>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`magic_${N}x${N}`, {
        file: "basics/magic",
        template: "MagicSquare",
        params: [N],
      });
    });

    it("should compute correctly", async () => {
      await circuit.expectPass(INPUT, OUTPUT);
    });

    // TODO fail checks
  })
);
