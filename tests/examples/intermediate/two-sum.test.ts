import type { WitnessTester } from "circomkit";
import { circomkit, primes } from "../../common";
import { describe, it } from "bun:test";

// the usual O(n) solution with a hashmap, which runs outside the circuit
function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>();
  for (let j = 0; j < nums.length; j++) {
    const i = seen.get(target - nums[j]);
    if (i !== undefined) {
      return [i, j];
    }
    seen.set(nums[j], j);
  }
  throw new Error("no solution");
}

const testers: Record<number, Promise<WitnessTester<["nums", "target", "i", "j"]>>> = {};
function circuit(n: number) {
  testers[n] ??= circomkit.WitnessTester(`two_sum_${n}`, {
    file: "examples/intermediate/two-sum",
    template: "TwoSum",
    dir: "test/examples/intermediate",
    params: [n],
    pubs: ["nums", "target"],
  });
  return testers[n];
}

describe("two sum", () => {
  it("should accept the examples from LeetCode", async () => {
    for (const [nums, target] of [
      [[2, 7, 11, 15], 9],
      [[3, 2, 4], 6],
      [[3, 3], 6],
    ] as [number[], number][]) {
      const [i, j] = twoSum(nums, target);
      await (await circuit(nums.length)).expectPass({ nums, target, i, j });
    }
  });

  it("should accept negative numbers", async () => {
    const [nums, target] = [[-3, 4, 3, 90], 0];
    await (await circuit(4)).expectPass({ nums, target, i: 0, j: 2 });
  });

  it("should accept random solutions", async () => {
    const N = 10;
    for (let t = 0; t < 5; t++) {
      const nums = Array.from({ length: N }, () => Math.floor(Math.random() * 1000));
      const [i, j] = [Math.floor(Math.random() * (N - 1)), N - 1];
      const target = nums[i] + nums[j];
      const [i_, j_] = twoSum(nums, target); // may find another pair with the same sum
      await (await circuit(N)).expectPass({ nums, target, i: i_, j: j_ });
    }
  });

  describe("invalid indices", () => {
    const [nums, target] = [[2, 7, 11, 15], 9];

    it("should NOT accept a pair with a wrong sum", async () => {
      await (await circuit(4)).expectFail({ nums, target, i: 0, j: 2 });
    });

    it("should NOT accept the same index twice", async () => {
      // 2 + 2 = 4, but there is only one 2
      await (await circuit(4)).expectFail({ nums, target: 4, i: 0, j: 0 });
    });

    it("should NOT accept indices in reverse order", async () => {
      await (await circuit(4)).expectFail({ nums, target, i: 1, j: 0 });
    });

    it("should NOT accept an out-of-bounds index", async () => {
      // `ArrayRead` would return 0 for `j = 4`, and 2 + 0 = 2
      await (await circuit(4)).expectFail({ nums, target: 2, i: 0, j: 4 });
      // same for a "negative" index
      await (await circuit(4)).expectFail({ nums, target: 2, i: primes.bn128 - 1n, j: 0 });
    });
  });
});
