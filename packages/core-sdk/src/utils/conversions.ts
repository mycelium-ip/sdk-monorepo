import { BN } from "@coral-xyz/anchor";
import { sha256 } from "@noble/hashes/sha2.js";
import type { PublicKey } from "@solana/web3.js";
import type { StringOrBytes } from "../types";

export function sha256Hash(data: Uint8Array): Uint8Array {
  return sha256(data);
}

export function utf8Bytes(value: string): Uint8Array {
  const encoded = encodeURIComponent(value);
  const bytes: number[] = [];

  for (let i = 0; i < encoded.length; i += 1) {
    const char = encoded[i];
    if (char === "%") {
      bytes.push(Number.parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 2;
      continue;
    }

    bytes.push(char.charCodeAt(0));
  }

  return Uint8Array.from(bytes);
}

export function normalizeBytes(value: StringOrBytes): Uint8Array {
  if (typeof value === "string") {
    if (value.startsWith("0x") && /^[0-9a-fA-F]+$/.test(value.slice(2))) {
      const hex = value.slice(2);
      if (hex.length % 2 !== 0) {
        throw new Error("Hex string must have even length");
      }
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
      }
      return bytes;
    }
    return utf8Bytes(value);
  }

  if (value instanceof Uint8Array) {
    return value;
  }

  return Uint8Array.from(value);
}

export function toFixedBytes(
  value: StringOrBytes,
  byteLength: number,
  label: string,
): number[] {
  const normalized = normalizeBytes(value);
  if (normalized.length > byteLength) {
    throw new Error(`${label} exceeds maximum length of ${byteLength} bytes`);
  }

  const out = new Uint8Array(byteLength);
  out.set(normalized);
  return [...out];
}

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

export function u64SeedBytes(value: bigint | number): Uint8Array {
  const n = BigInt(value);
  if (n < BigInt(0)) {
    throw new Error("u64 seed must be >= 0");
  }

  const out = new Uint8Array(8);
  let working = n;
  for (let i = 0; i < 8; i += 1) {
    out[i] = Number(working & BigInt(255));
    working >>= BigInt(8);
  }

  return out;
}

export function pubkeyListToBase58(pubkeys: PublicKey[]): string[] {
  return pubkeys.map((pubkey) => pubkey.toBase58());
}
