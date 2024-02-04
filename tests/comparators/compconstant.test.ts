import type { WitnessTester } from "circomkit";
import { circomkit, toBinary } from "../common";

describe("compconstant", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  const CONSTANT = Math.round(Math.random() * 10000);

  before(async () => {
    circuit = await circomkit.WitnessTester(`compconstant`, {
      file: "comparators/compconstant",
      template: "CompConstant",
      dir: "test/comparators",
      params: [CONSTANT],
    });
    console.log("#constraints:", await circuit.getConstraintCount());
  });

  it("should return 0 when `in` < constant", async () => {
    await circuit.expectPass({ in: toBinary(CONSTANT - 1) }, { out: 0 });
  });

  it("should return 0 when `in` == constant", async () => {
    await circuit.expectPass({ in: toBinary(CONSTANT) }, { out: 0 });
  });

  it("should return 1 when `in` > constant", async () => {
    await circuit.expectPass({ in: toBinary(CONSTANT + 1) }, { out: 1 });
  });
});
