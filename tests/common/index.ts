import { Circomkit, type CircomkitConfig } from "circomkit";

export const circomkit = new Circomkit({ verbose: false, inspect: true });

// Convert a number to its binary representation with `bits` bits.
// By default, returns 254 bit representation.
//
// The result is in little-endian, i.e. bit[0] is the LSB.
export function toBinary(n: number | bigint, bits: number = 254) {
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

export const primes: Record<CircomkitConfig["prime"], bigint> = {
  bn128: 21888242871839275222246405745257275088548364400416034343698204186575808495617n,
  bls12381: 52435875175126190479447740508185965837690552500527637822603658699938581184513n,
  goldilocks: 18446744069414584321n,
  grumpkin: 21888242871839275222246405745257275088696311157297823662689037894645226208583n,
  pallas: 28948022309329048855892746252171976963363056481941560715954676764349967630337n,
  vesta: 28948022309329048855892746252171976963363056481941647379679742748393362948097n,
  secq256r1: 115792089210356248762697446949407573530086143415290314195533631308867097853951n,
} as const;
