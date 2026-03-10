import { BN } from "@coral-xyz/anchor";

export function toU64Bn(value: bigint | number, label = "value"): BN {
  if (typeof value === "number" && !Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`);
  }

  const asBigInt = BigInt(value);
  if (asBigInt < BigInt(0)) {
    throw new Error(`${label} must be >= 0`);
  }

  return new BN(asBigInt.toString());
}

export function toI64Bn(value: bigint | number, label = "value"): BN {
  if (typeof value === "number" && !Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`);
  }

  return new BN(BigInt(value).toString());
}
