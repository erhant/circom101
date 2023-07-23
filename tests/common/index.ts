import { Circomkit } from "circomkit";

export const circomkit = new Circomkit({ verbose: false });

// Convert a number to its binary representation with `bits` bits.
// By default, returns 254 bit representation.
//
// The result is in little-endian, i.e. bit[0] is the LSB.
export function toBinary(n: number, bits: number = 254) {
  if (bits > 254) {
    throw new Error("Bits must be less-eq than 254.");
  }

  const bitStr = BigInt(n).toString(2);
  if (bitStr.length > bits) {
    throw new Error("Number not representable by " + bits + " bits");
  } else if (bitStr.length < bits) {
    return ("0".repeat(bits - bitStr.length) + bitStr)
      .split("")
      .map((x) => (x === "0" ? 0 : 1))
      .reverse();
  } else {
    return bitStr
      .split("")
      .map((x) => (x === "0" ? 0 : 1))
      .reverse();
  }
}
