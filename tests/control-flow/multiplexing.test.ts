import { circomkit } from "../common";
import { describe, beforeAll, it } from "bun:test";

describe("multiplexing", () => {
  it("2-to-1 multiplex", async () => {
    const circuit = await circomkit.WitnessTester<["in", "sel"], ["out"]>(`mux1`, {
      file: "control-flow/multiplexing",
      template: "Mux1",
      dir: "test/control-flow",
    });

    const input = [101, 202];
    await circuit.expectPass({ in: input, sel: 0 }, { out: input[0] });
    await circuit.expectPass({ in: input, sel: 1 }, { out: input[1] });
  });

  it("4-to-1 multiplex", async () => {
    const circuit = await circomkit.WitnessTester<["in", "sel"], ["out"]>(`mux1`, {
      file: "control-flow/multiplexing",
      template: "Mux2",
      dir: "test/control-flow",
    });

    const input = [234, 678, 123, 987];
    await circuit.expectPass({ in: input, sel: [0, 0] }, { out: input[0] });
    await circuit.expectPass({ in: input, sel: [1, 0] }, { out: input[1] });
    await circuit.expectPass({ in: input, sel: [0, 1] }, { out: input[2] });
    await circuit.expectPass({ in: input, sel: [1, 1] }, { out: input[3] });
  });
});
