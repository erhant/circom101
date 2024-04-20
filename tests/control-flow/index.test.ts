import { circomkit } from "../common";
import { describe, beforeAll, it } from "bun:test";

describe("control-flow", () => {
  it("if-else", async () => {
    const circuit = await circomkit.WitnessTester<["cond", "ifTrue", "ifFalse"], ["out"]>(`ifelse`, {
      file: "control-flow/index",
      template: "IfElse",
      dir: "test/control-flow",
    });

    await circuit.expectPass({ cond: 0, ifTrue: 123, ifFalse: 789 }, { out: 789 });
    await circuit.expectPass({ cond: 1, ifTrue: 123, ifFalse: 789 }, { out: 123 });
  });

  it("switch", async () => {
    const circuit = await circomkit.WitnessTester<["cond", "in"], ["out"]>(`switch`, {
      file: "control-flow/index",
      template: "Switch",
      dir: "test/control-flow",
    });

    await circuit.expectPass({ cond: 0, in: [123, 789] }, { out: [123, 789] });
    await circuit.expectPass({ cond: 1, in: [123, 789] }, { out: [789, 123] });
  });
});
