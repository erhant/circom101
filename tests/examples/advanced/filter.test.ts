import type { WitnessTester } from "circomkit";
import { circomkit } from "../../common";
import { describe, beforeAll, it, expect } from "bun:test";

// prettier-ignore
const EXAMPLE = {
  in: [
    [6, 8], [7, 6], [10, 7], [7, 5], [2, 9], [8, 6], [9, 4], [2, 7], [7, 6], [8, 1],
    [5, 5], [3, 9], [4, 9], [3, 4], [10, 5], [1, 10], [2, 10], [7, 3], [10, 4], [9, 5],
    [6, 9], [7, 8], [10, 5], [1, 7], [9, 7], [9, 8], [5, 4], [9, 8], [2, 2], [5, 3],
    [1, 5], [1, 9], [1, 3], [6, 6], [10, 1], [1, 7], [6, 9], [4, 3], [9, 8], [7, 9],
    [2, 10], [3, 6], [5, 6], [8, 5], [9, 2], [3, 1], [5, 4], [2, 4], [5, 7], [2, 4],
    [7, 7], [4, 10], [7, 9], [8, 10], [2, 2], [6, 8], [10, 10], [5, 2], [4, 4], [3, 3],
    [4, 4], [3, 7], [1, 5], [10, 1], [7, 10], [8, 9], [8, 3], [9, 1], [7, 4], [2, 4],
    [8, 7], [2, 5], [1, 8], [5, 6], [2, 3], [3, 8], [10, 5], [8, 9], [8, 1], [3, 8],
    [5, 10], [7, 4], [7, 1], [4, 9], [6, 1], [7, 6], [6, 2], [7, 10], [3, 7], [4, 3],
    [4, 6], [4, 1], [3, 7], [7, 8], [3, 10], [2, 8], [4, 9], [2, 10], [7, 5], [9, 1],
  ],
  match: 5,
};

// reference implementation
function filter(tuples: number[][], match: number) {
  const matches = tuples.filter(([a]) => a === match);
  const out = [...matches, ...Array.from({ length: tuples.length - matches.length }, () => [0, 0])];
  return { num_match: matches.length, out };
}

// `n` random tuples where the first entry is in [0, max)
function randomTuples(n: number, max: number) {
  return Array.from({ length: n }, () => [Math.floor(Math.random() * max), Math.floor(Math.random() * 1000)]);
}

[100, 10].map((N) =>
  describe(`filter (${N} tuples)`, () => {
    let circuit: WitnessTester<["in", "match"], ["num_match", "out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`filter_${N}`, {
        file: "examples/advanced/filter",
        template: "Filter",
        dir: "test/examples/advanced",
        params: [N],
      });
    });

    if (N === 100) {
      it("should filter the example from the challenge", async () => {
        const output = filter(EXAMPLE.in, EXAMPLE.match);
        expect(output.num_match).toBe(9);
        await circuit.expectPass(EXAMPLE, output);
      });
    }

    it("should filter random tuples", async () => {
      // smaller `max` means more matches
      for (const max of [2, 3, 5, 10, 50]) {
        const tuples = randomTuples(N, max);
        await circuit.expectPass({ in: tuples, match: 1 }, filter(tuples, 1));
      }
    });

    it("should filter when nothing matches", async () => {
      const tuples = randomTuples(N, 10);
      await circuit.expectPass({ in: tuples, match: 99 }, filter(tuples, 99));
    });

    it("should filter when everything matches", async () => {
      const tuples = randomTuples(N, 1);
      await circuit.expectPass({ in: tuples, match: 0 }, filter(tuples, 0));
    });

    it("should filter when only the last tuple matches", async () => {
      const tuples = Array.from({ length: N }, (_, i) => [i === N - 1 ? 7 : 0, i + 1]);
      await circuit.expectPass({ in: tuples, match: 7 }, filter(tuples, 7));
    });
  }),
);
