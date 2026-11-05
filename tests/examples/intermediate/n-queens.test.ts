import type { WitnessTester } from "circomkit";
import { circomkit } from "../../common";
import { describe, it, expect } from "bun:test";

const testers: Record<number, Promise<WitnessTester<["queens"]>>> = {};
function circuit(n: number) {
  testers[n] ??= circomkit.WitnessTester(`n_queens_${n}`, {
    file: "examples/intermediate/n-queens",
    template: "NQueens",
    dir: "test/examples/intermediate",
    params: [n],
  });
  return testers[n];
}

// all permutations of [0, 1, ..., n-1]
function permutations(n: number): number[][] {
  if (n === 0) return [[]];
  return permutations(n - 1).flatMap((p) =>
    Array.from({ length: n }, (_, i) => [...p.slice(0, i), n - 1, ...p.slice(i)]),
  );
}

describe("n-queens", () => {
  it("should accept valid placements", async () => {
    await (await circuit(4)).expectPass({ queens: [1, 3, 0, 2] });
    await (await circuit(4)).expectPass({ queens: [2, 0, 3, 1] });
    await (await circuit(8)).expectPass({ queens: [0, 4, 7, 5, 2, 6, 1, 3] });
  });

  it("should NOT accept two queens on the same column", async () => {
    await (await circuit(4)).expectFail({ queens: [1, 1, 0, 2] });
  });

  it("should NOT accept two queens on the same diagonal", async () => {
    // (0, 0) and (1, 1)
    await (await circuit(4)).expectFail({ queens: [0, 1, 3, 2] });
    // (0, 1) and (1, 0)
    await (await circuit(4)).expectFail({ queens: [1, 0, 3, 2] });
  });

  it("should NOT accept a queen outside the board", async () => {
    await (await circuit(4)).expectFail({ queens: [1, 3, 0, 4] });
  });

  it("should accept exactly the 4 solutions of the 6-queens puzzle", async () => {
    const c = await circuit(6);
    const accepted: number[][] = [];
    for (const queens of permutations(6)) {
      try {
        await c.calculateWitness({ queens });
        accepted.push(queens);
      } catch {}
    }
    expect(accepted.length).toBe(4);
  });
});
