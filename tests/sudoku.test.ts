import type { WitnessTester } from "circomkit";
import { circomkit } from "./common";
import { BOARD_SIZES, SUDOKU_INPUTS } from "./data/sudoku";

BOARD_SIZES.map((N) =>
  describe(`sudoku (${N} by ${N})`, () => {
    const INPUT = SUDOKU_INPUTS[N];
    let circuit: WitnessTester<["solution", "puzzle"]>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`sudoku_${N}x${N}`, {
        file: "examples/sudoku",
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

describe("sudoku utilities", () => {
  describe("assert bit length", () => {
    const b = 3; // bit count

    let circuit: WitnessTester<["in"], []>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`bitlen_${b}`, {
        file: "examples/sudoku",
        template: "AssertBitLength",
        dir: "test/sudoku",
        params: [b],
      });
    });

    it("should pass for input < 2^b", async () => {
      await circuit.expectPass({
        in: 2 ** b - 1,
      });
    });

    it("should fail for input ≥ 2^b ", async () => {
      await circuit.expectFail({
        in: 2 ** b,
      });
      await circuit.expectFail({
        in: 2 ** b + 1,
      });
    });
  });

  describe("distinct", () => {
    const n = 3;
    let circuit: WitnessTester<["in"], []>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`distinct_${n}`, {
        file: "examples/sudoku",
        template: "Distinct",
        dir: "test/sudoku",
        params: [n],
      });
    });

    it("should pass if all inputs are unique", async () => {
      await circuit.expectPass({
        in: Array(n)
          .fill(0)
          .map((v, i) => v + i),
      });
    });

    it("should fail if there is a duplicate", async () => {
      const arr = Array(n)
        .fill(0)
        .map((v, i) => v + i);
      // make a duplicate
      arr[0] = arr[arr.length - 1];
      await circuit.expectFail({
        in: arr,
      });
    });
  });

  describe("in range", () => {
    const MIN = 1;
    const MAX = 9;
    let circuit: WitnessTester<["in"]>;

    before(async () => {
      circuit = await circomkit.WitnessTester(`inRange_${MIN}_${MAX}`, {
        file: "examples/sudoku",
        template: "InRange",
        dir: "test/sudoku",
        params: [MIN, MAX],
      });
    });

    it("should pass for in range", async () => {
      await circuit.expectPass({
        in: MAX,
      });
      await circuit.expectPass({
        in: MIN,
      });
      await circuit.expectPass({
        in: Math.floor((MIN + MAX) / 2),
      });
    });

    it("should FAIL for out of range (upper bound)", async () => {
      await circuit.expectFail({
        in: MAX + 1,
      });
    });

    it("should FAIL for out of range (lower bound)", async () => {
      if (MIN > 0) {
        await circuit.expectFail({
          in: MIN - 1,
        });
      }
    });
  });
});
