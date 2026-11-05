import type { WitnessTester } from "circomkit";
import { circomkit } from "../../common";
import { describe, it } from "bun:test";

const testers: Record<number, Promise<WitnessTester<["nums"], ["out"]>>> = {};
function circuit(n: number) {
  testers[n] ??= circomkit.WitnessTester(`missing_number_${n}`, {
    file: "examples/simple/missing-number",
    template: "MissingNumber",
    dir: "test/examples/simple",
    params: [n],
  });
  return testers[n];
}

describe("missing number", () => {
  it("should find the missing number in the examples from LeetCode", async () => {
    for (const [nums, out] of [
      [[3, 0, 1], 2],
      [[0, 1], 2],
      [[9, 6, 4, 2, 3, 5, 7, 0, 1], 8],
    ] as [number[], number][]) {
      await (await circuit(nums.length)).expectPass({ nums }, { out });
    }
  });

  it("should find the missing number in random arrays", async () => {
    const N = 9;
    for (let missing = 0; missing <= N; missing++) {
      const nums = Array.from({ length: N + 1 }, (_, i) => i)
        .filter((x) => x !== missing)
        .sort(() => Math.random() - 0.5);
      await (await circuit(N)).expectPass({ nums }, { out: missing });
    }
  });

  it("should NOT accept repeated numbers", async () => {
    // the sum formula alone would say that 2 is missing
    await (await circuit(3)).expectFail({ nums: [0, 0, 1 + 3] });
    await (await circuit(3)).expectFail({ nums: [3, 3, 0] });
  });

  it("should NOT accept out-of-range numbers", async () => {
    // the sum formula alone would say that 0 is missing
    await (await circuit(3)).expectFail({ nums: [1, 1 + 3, 1] });
    await (await circuit(3)).expectFail({ nums: [4, 0, 1] });
  });
});
