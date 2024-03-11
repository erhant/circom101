import type { WitnessTester } from "circomkit";
import { circomkit } from "../../common";

const BOARD_SIZES = [4, 9] as const;
type BOARD_SIZES = (typeof BOARD_SIZES)[number];

const SUDOKU_INPUTS: {
  [N in BOARD_SIZES]: { solution: number[][]; puzzle: number[][] };
} = {
  9: {
    solution: [
      [1, 9, 4, 8, 6, 5, 2, 3, 7],
      [7, 3, 5, 4, 1, 2, 9, 6, 8],
      [8, 6, 2, 3, 9, 7, 1, 4, 5],
      [9, 2, 1, 7, 4, 8, 3, 5, 6],
      [6, 7, 8, 5, 3, 1, 4, 2, 9],
      [4, 5, 3, 9, 2, 6, 8, 7, 1],
      [3, 8, 9, 6, 5, 4, 7, 1, 2],
      [2, 4, 6, 1, 7, 9, 5, 8, 3],
      [5, 1, 7, 2, 8, 3, 6, 9, 4],
    ],
    puzzle: [
      [0, 0, 0, 8, 6, 0, 2, 3, 0],
      [7, 0, 5, 0, 0, 0, 9, 0, 8],
      [0, 6, 0, 3, 0, 7, 0, 4, 0],
      [0, 2, 0, 7, 0, 8, 0, 5, 0],
      [0, 7, 8, 5, 0, 0, 0, 0, 0],
      [4, 0, 0, 9, 0, 6, 0, 7, 0],
      [3, 0, 9, 0, 5, 0, 7, 0, 2],
      [0, 4, 0, 1, 0, 9, 0, 8, 0],
      [5, 0, 7, 0, 8, 0, 0, 9, 4],
    ],
  },
  4: {
    solution: [
      [4, 1, 3, 2],
      [3, 2, 4, 1],
      [2, 4, 1, 3],
      [1, 3, 2, 4],
    ],
    puzzle: [
      [0, 1, 0, 2],
      [3, 2, 0, 0],
      [0, 0, 1, 0],
      [1, 0, 0, 0],
    ],
  },
};

BOARD_SIZES.map((N) =>
  describe(`sudoku (${N} by ${N})`, () => {
    const INPUT = SUDOKU_INPUTS[N];
    let circuit: WitnessTester<["solution", "puzzle"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`sudoku_${N}x${N}`, {
        file: "examples/intermediate/sudoku",
        template: "Sudoku",
        dir: "test/examples/intermediate",
        pubs: ["puzzle"],
        params: [Math.sqrt(N)],
      });
    });

    it("should compute correctly", async () => {
      await circuit.expectPass(INPUT);
    });

    it("should NOT accept non-distinct rows", async () => {
      const badInput = { ...INPUT };
      badInput.solution[0][0] = badInput.solution[0][1];
      await circuit.expectFail(badInput);
    });

    it("should NOT accept non-distinct columns", async () => {
      const badInput = { ...INPUT };
      badInput.solution[0][0] = badInput.solution[1][0];
      await circuit.expectFail(badInput);
    });

    it("should NOT accept non-distinct square", async () => {
      const badInput = { ...INPUT };
      badInput.solution[0][0] = badInput.solution[1][1];
      await circuit.expectFail(badInput);
    });

    it("should NOT accept empty value in solution", async () => {
      const badInput = { ...INPUT };
      badInput.solution[0][0] = 0;
      await circuit.expectFail(badInput);
    });

    it("should NOT accept out-of-range values", async () => {
      const badInput = { ...INPUT };
      badInput.solution[0][0] = 99999;
      await circuit.expectFail(badInput);
    });
  }),
);
