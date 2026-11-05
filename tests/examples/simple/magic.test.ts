import type { WitnessTester } from "circomkit";
import { circomkit } from "../../common";
import { describe, beforeAll, it } from "bun:test";

// board sizes
const MAGIC_SIZES = [3, 4] as const;
type MAGIC_SIZES = (typeof MAGIC_SIZES)[number];

const MAGIC_INPUTS: {
  [N in MAGIC_SIZES]: {
    // a normal magic square
    in: number[][];
    // every line sums up correctly & values are in range, but values are not distinct
    repeated: number[][];
  };
} = {
  3: {
    in: [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6],
    ],
    repeated: [
      [5, 5, 5],
      [5, 5, 5],
      [5, 5, 5],
    ],
  },
  4: {
    in: [
      [4, 14, 15, 1],
      [9, 7, 6, 12],
      [5, 11, 10, 8],
      [16, 2, 3, 13],
    ],
    repeated: [
      [8, 8, 9, 9],
      [9, 9, 8, 8],
      [8, 8, 9, 9],
      [9, 9, 8, 8],
    ],
  },
};

MAGIC_SIZES.map((N) =>
  describe(`magic (${N} by ${N})`, () => {
    const INPUT = MAGIC_INPUTS[N];
    let circuit: WitnessTester<["in"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`magic_${N}x${N}`, {
        file: "examples/simple/magic",
        template: "MagicSquare",
        dir: "test/examples/simple",
        params: [N],
      });
    });

    it("should pass for correct magic squares", async () => {
      await circuit.expectPass({ in: INPUT.in });
    });

    it("should NOT accept wrong sums", async () => {
      // swapping two cells of a column keeps values distinct & in range, but breaks the row sums
      const square = INPUT.in.map((row) => [...row]);
      [square[0][0], square[1][0]] = [square[1][0], square[0][0]];
      await circuit.expectFail({ in: square });
    });

    it("should NOT accept repeated values", async () => {
      await circuit.expectFail({ in: INPUT.repeated });
    });
  }),
);

describe("magic (3 by 3) out-of-range", () => {
  it("should NOT accept out-of-range values", async () => {
    const circuit = await circomkit.WitnessTester(`magic_3x3`, {
      file: "examples/simple/magic",
      template: "MagicSquare",
      dir: "test/examples/simple",
      params: [3],
    });

    // a magic square with distinct values, but uses 0 and 10
    await circuit.expectFail({
      in: [
        [6, 0, 9],
        [8, 5, 2],
        [1, 10, 4],
      ],
    });
  });
});
