import type { CircuitSignals } from "circomkit";

export const MAGIC_SIZES = [3, 4] as const;
export const MAGIC_INPUTS: {
  [N in (typeof MAGIC_SIZES)[number]]: CircuitSignals<["in"]>;
} = {
  3: {
    in: [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6],
    ],
  },
  4: {
    in: [
      [4, 14, 15, 1],
      [9, 7, 6, 12],
      [5, 11, 10, 8],
      [16, 2, 3, 13],
    ],
  },
};
