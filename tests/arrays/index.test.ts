import type { WitnessTester } from "circomkit";
import { circomkit, primes } from "../common";

describe("arrays", () => {
  const N = 10;
  const arr = Array.from({ length: N }, (_, i) => i);

  describe("reads", () => {
    let circuit: WitnessTester<["in", "index"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`arr_read_${N}`, {
        file: "arrays/index",
        template: "ArrayRead",
        dir: "test/arrays",
        params: [N],
      });
    });

    it("should read correct index", async () => {
      for (let i = 0; i < N; i += N >> 2) {
        await circuit.expectPass({ in: arr, index: i }, { out: arr[i] });
      }
    });

    it("should read 0 for out-of-bounds index", async () => {
      await circuit.expectPass({ in: arr, index: N }, { out: 0 });
      await circuit.expectPass({ in: arr, index: -1 }, { out: 0 });
    });
  });

  describe("writes", () => {
    let circuit: WitnessTester<["in", "index", "value"], ["out"]>;

    beforeAll(async () => {
      circuit = await circomkit.WitnessTester(`arr_sum_${N}`, {
        file: "arrays/index",
        template: "ArrayWrite",
        dir: "test/arrays",
        params: [N],
      });
    });

    it("should write correctly", async () => {
      for (let i = 0; i < N; i += N >> 2) {
        const newArr = [...arr];
        const val = i * 10;
        newArr[i] = val;
        await circuit.expectPass({ in: arr, index: i, value: val }, { out: newArr });
      }
    });

    it("should return the same array for out-of-bounds index", async () => {
      await circuit.expectPass({ in: arr, index: N, value: -1 }, { out: arr });
      await circuit.expectPass({ in: arr, index: -1, value: -1 }, { out: arr });
    });
  });
});
