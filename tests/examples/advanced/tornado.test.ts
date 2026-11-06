import type { WitnessTester } from "circomkit";
import { IMT } from "@zk-kit/imt";
import { poseidon1, poseidon2 } from "poseidon-lite";
import { circomkit } from "../../common";
import { describe, beforeAll, it } from "bun:test";

const DEPTH = 8;
const [recipient, relayer, fee] = [0xabcdn, 0x1234n, 100n];

// a deposit is two random secrets, and the commitment is added to the tree
function deposit(tree: IMT) {
  const random = () => BigInt(Math.floor(Math.random() * 2 ** 48));
  const [nullifier, secret] = [random(), random()];
  tree.insert(poseidon2([nullifier, secret]));
  return { nullifier, secret, index: tree.leaves.length - 1 };
}

// the withdrawal inputs of a deposit
function withdraw(tree: IMT, { nullifier, secret, index }: ReturnType<typeof deposit>) {
  const siblings = tree.createProof(index).siblings.map((s) => s[0]);
  return {
    root: tree.root,
    nullifierHash: poseidon1([nullifier]),
    recipient,
    relayer,
    fee,
    nullifier,
    secret,
    index,
    siblings,
  };
}

describe("tornado cash", () => {
  let circuit: WitnessTester<
    ["root", "nullifierHash", "recipient", "relayer", "fee", "nullifier", "secret", "index", "siblings"]
  >;
  let tree: IMT;
  let deposits: ReturnType<typeof deposit>[];

  beforeAll(async () => {
    circuit = await circomkit.WitnessTester(`tornado_${DEPTH}`, {
      file: "examples/advanced/tornado",
      template: "Withdraw",
      dir: "test/examples/advanced",
      params: [DEPTH],
      pubs: ["root", "nullifierHash", "recipient", "relayer", "fee"],
    });

    tree = new IMT((v) => poseidon2(v.map(BigInt)), DEPTH, 0n, 2);
    deposits = Array.from({ length: 5 }, () => deposit(tree));
  });

  it("should withdraw any deposit", async () => {
    for (const d of deposits) {
      await circuit.expectPass(withdraw(tree, d));
    }
  });

  it("should NOT withdraw with a wrong secret", async () => {
    const inputs = withdraw(tree, deposits[1]);
    await circuit.expectFail({ ...inputs, secret: inputs.secret + 1n });
  });

  it("should NOT withdraw with a nullifier hash of another deposit", async () => {
    const inputs = withdraw(tree, deposits[1]);
    await circuit.expectFail({ ...inputs, nullifierHash: poseidon1([deposits[2].nullifier]) });
  });

  it("should NOT withdraw a deposit that is not in the tree", async () => {
    const other = new IMT((v) => poseidon2(v.map(BigInt)), DEPTH, 0n, 2);
    const fake = deposit(other);
    await circuit.expectFail({ ...withdraw(other, fake), root: tree.root });
  });

  it("should NOT withdraw at a different index", async () => {
    const inputs = withdraw(tree, deposits[1]);
    await circuit.expectFail({ ...inputs, index: 2 });
  });
});
