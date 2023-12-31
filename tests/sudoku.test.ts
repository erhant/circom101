import type { WitnessTester } from "circomkit";
import { circomkit } from "./common";
import { BOARD_SIZES, SUDOKU_INPUTS } from "./data/sudoku";

BOARD_SIZES.map((N) =>
  describe(`sudoku (${N} by ${N})`, () => {
    const INPUT = SUDOKU_INPUTS[N];
    let circuit: WitnessTester<["solution", "puzzle"]>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`sudoku_${N}x${N}`, {
        file: "basics/sudoku",
        template: "Sudoku",
        pubs: ["puzzle"],
        params: [Math.sqrt(N)],
      });
    });

    it("should compute correctly", async () => {
      await circuit.expectPass(INPUT);
    });

    it("should NOT accept non-distinct rows", async () => {
      const badInput = JSON.parse(JSON.stringify(INPUT));
      badInput.solution[0][0] = badInput.solution[0][1];
      await circuit.expectFail(badInput);
    });

    it("should NOT accept non-distinct columns", async () => {
      const badInput = JSON.parse(JSON.stringify(INPUT));
      badInput.solution[0][0] = badInput.solution[1][0];
      await circuit.expectFail(badInput);
    });

    it("should NOT accept non-distinct square", async () => {
      const badInput = JSON.parse(JSON.stringify(INPUT));
      badInput.solution[0][0] = badInput.solution[1][1];
      await circuit.expectFail(badInput);
    });

    it("should NOT accept empty value in solution", async () => {
      const badInput = JSON.parse(JSON.stringify(INPUT));
      badInput.solution[0][0] = 0;
      await circuit.expectFail(badInput);
    });

    it("should NOT accept out-of-range values", async () => {
      const badInput = JSON.parse(JSON.stringify(INPUT));
      badInput.solution[0][0] = 99999;
      await circuit.expectFail(badInput);
    });
  })
);
