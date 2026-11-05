import type { WitnessTester } from "circomkit";
import { readFileSync } from "fs";
import { circomkit, primes } from "../common";
import { describe, beforeAll, it } from "bun:test";

const p = primes.bn128;
const mod = (x: bigint) => ((x % p) + p) % p;
const pow = (x: bigint, e: number) => {
  let r = 1n;
  for (let i = 0; i < e; i++) r = mod(r * x);
  return r;
};

// read the round constants from Circomlib's sources
function constants(file: string, name: string) {
  const src = readFileSync(`./node_modules/circomlib/circuits/${file}`, "utf8");
  const body = src.slice(src.indexOf(`var ${name}`), src.indexOf("];", src.indexOf(`var ${name}`)));
  return [...body.slice(body.indexOf("[", body.indexOf("=")) + 1).matchAll(/\d+/g)].map((m) => BigInt(m[0]));
}
const C7 = constants("mimc.circom", "c[91]");
const C_FEISTEL = [0n, ...constants("mimcsponge.circom", "c_partial[218]"), 0n];

// MiMC-7 block cipher: `nRounds` rounds of `x -> (x + k + c_i)^7`, then add the key once more
function mimc7(x: bigint, k: bigint, nRounds = 91) {
  for (let i = 0; i < nRounds; i++) {
    x = pow(mod(x + k + C7[i]), 7);
  }
  return mod(x + k);
}

// MiMC-7 hash with the Miyaguchi–Preneel construction
function multiMimc7(inputs: bigint[], k: bigint) {
  let r = k;
  for (const x of inputs) {
    r = mod(r + x + mimc7(x, r));
  }
  return r;
}

// MiMC-5 in a Feistel network: `(xL, xR) -> (xR + (xL + k + c_i)^5, xL)`, without swapping in the last round
function mimcFeistel(xL: bigint, xR: bigint, k: bigint, nRounds = 220) {
  for (let i = 0; i < nRounds; i++) {
    const t = pow(mod(xL + k + C_FEISTEL[i]), 5);
    if (i < nRounds - 1) {
      [xL, xR] = [mod(xR + t), xL];
    } else {
      xR = mod(xR + t);
    }
  }
  return [xL, xR];
}

// sponge: absorb each input into the left element, permute, and squeeze the left element as output
function mimcSponge(inputs: bigint[], k: bigint, nOutputs: number) {
  let [xL, xR] = [0n, 0n];
  for (const x of inputs) {
    [xL, xR] = mimcFeistel(mod(xL + x), xR, k);
  }
  const outs = [xL];
  for (let i = 1; i < nOutputs; i++) {
    [xL, xR] = mimcFeistel(xL, xR, k);
    outs.push(xL);
  }
  return outs;
}

const randomField = () => mod(BigInt(Math.floor(Math.random() * 2 ** 52)) ** 5n);

describe("mimc", () => {
  describe("MiMC7", () => {
    let circuit: WitnessTester<["x_in", "k"], ["out"]>;
    beforeAll(async () => {
      circuit = await circomkit.WitnessTester("mimc7", {
        file: "hashing/mimc",
        template: "MiMC7",
        dir: "test/hashing",
        params: [91],
      });
    });

    it("should match the reference implementation", async () => {
      for (let t = 0; t < 3; t++) {
        const [x_in, k] = [randomField(), randomField()];
        await circuit.expectPass({ x_in, k }, { out: mimc7(x_in, k) });
      }
    });
  });

  describe("MultiMiMC7", () => {
    let circuit: WitnessTester<["in", "k"], ["out"]>;
    beforeAll(async () => {
      circuit = await circomkit.WitnessTester("multimimc7_3", {
        file: "hashing/mimc",
        template: "MultiMiMC7",
        dir: "test/hashing",
        params: [3, 91],
      });
    });

    it("should match the reference implementation", async () => {
      const [inputs, k] = [[randomField(), randomField(), randomField()], randomField()];
      await circuit.expectPass({ in: inputs, k }, { out: multiMimc7(inputs, k) });
    });
  });

  describe("MiMCSponge", () => {
    let circuit: WitnessTester<["ins", "k"], ["outs"]>;
    beforeAll(async () => {
      circuit = await circomkit.WitnessTester("mimcsponge_2_1", {
        file: "hashing/mimc",
        template: "MiMCSponge",
        dir: "test/hashing",
        params: [2, 220, 1],
      });
    });

    it("should match the reference implementation", async () => {
      for (const k of [0n, randomField()]) {
        const inputs = [randomField(), randomField()];
        await circuit.expectPass({ ins: inputs, k }, { outs: mimcSponge(inputs, k, 1) });
      }
    });
  });
});
