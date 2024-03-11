import type { WitnessTester } from "circomkit";
import { circomkit } from "../../common";

// board sizes
const MAGIC_SIZES = [3, 4] as const;
type MAGIC_SIZES = (typeof MAGIC_SIZES)[number];

const MAGIC_INPUTS: {
  [N in MAGIC_SIZES]: { in: number[][]; sum: number };
} = {
  3: {
    in: [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6],
    ],
    sum: 15,
  },
  4: {
    in: [
      [4, 14, 15, 1],
      [9, 7, 6, 12],
      [5, 11, 10, 8],
      [16, 2, 3, 13],
    ],
    sum: 34,
  },
};

MAGIC_SIZES.map((N) =>
  describe(`magic (${N} by ${N})`, () => {
    const INPUT = MAGIC_INPUTS[N];
    const OUTPUT = {
      sum: INPUT.in[0].reduce((acc: number, cur: number) => acc + cur, 0),
    };
    let circuit: WitnessTester<["in", "sum"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`magic_${N}x${N}`, {
        file: "examples/simple/magic",
        template: "MagicSquare",
        dir: "test/examples/simple",
        params: [N],
        pubs: ["sum"],
      });
    });

    it("should pass for correct magic squares", async () => {
      await circuit.expectPass(INPUT, OUTPUT);
    });
  }),
);
