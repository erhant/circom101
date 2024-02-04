import type { WitnessTester } from "circomkit";
import { circomkit } from "../common";

describe("logic gates", () => {
  it("AND", async () => {
    const circuit = await circomkit.WitnessTester<["in"], ["out"]>(`and_gate`, {
      file: "bits/gates",
      template: "AND",
      dir: "test/bits",
    });

    await circuit.expectPass({ in: [0, 0] }, { out: 0 });
    await circuit.expectPass({ in: [0, 1] }, { out: 0 });
    await circuit.expectPass({ in: [1, 0] }, { out: 0 });
    await circuit.expectPass({ in: [1, 1] }, { out: 1 });
  });

  it("OR", async () => {
    const circuit = await circomkit.WitnessTester<["in"], ["out"]>(`or_gate`, {
      file: "bits/gates",
      template: "OR",
      dir: "test/bits",
    });

    await circuit.expectPass({ in: [0, 0] }, { out: 0 });
    await circuit.expectPass({ in: [0, 1] }, { out: 1 });
    await circuit.expectPass({ in: [1, 0] }, { out: 1 });
    await circuit.expectPass({ in: [1, 1] }, { out: 1 });
  });

  it("XOR", async () => {
    const circuit = await circomkit.WitnessTester<["in"], ["out"]>(`xor_gate`, {
      file: "bits/gates",
      template: "XOR",
      dir: "test/bits",
    });

    await circuit.expectPass({ in: [0, 0] }, { out: 0 });
    await circuit.expectPass({ in: [0, 1] }, { out: 1 });
    await circuit.expectPass({ in: [1, 0] }, { out: 1 });
    await circuit.expectPass({ in: [1, 1] }, { out: 0 });
  });

  it("NOT", async () => {
    const circuit = await circomkit.WitnessTester<["in"], ["out"]>(`not_gate`, {
      file: "bits/gates",
      template: "NOT",
      dir: "test/bits",
    });
    await circuit.expectPass({ in: 0 }, { out: 1 });
    await circuit.expectPass({ in: 1 }, { out: 0 });
  });
});
