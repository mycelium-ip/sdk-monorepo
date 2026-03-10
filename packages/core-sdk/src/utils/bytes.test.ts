import { describe, expect, it } from "vitest";
import { sha256Hash, toFixedBytes, u64SeedBytes, utf8Bytes } from "./bytes";

describe("bytes", () => {
  it("computes sha256 hash returning 32 bytes", () => {
    const hash = sha256Hash(utf8Bytes("hello"));
    expect(hash).toBeInstanceOf(Uint8Array);
    expect(hash.length).toBe(32);
    // Known SHA-256 of "hello"
    expect([...hash]).toEqual([
      0x2c, 0xf2, 0x4d, 0xba, 0x5f, 0xb0, 0xa3, 0x0e, 0x26, 0xe8, 0x3b, 0x2a,
      0xc5, 0xb9, 0xe2, 0x9e, 0x1b, 0x16, 0x1e, 0x5c, 0x1f, 0xa7, 0x42, 0x5e,
      0x73, 0x04, 0x33, 0x62, 0x93, 0x8b, 0x98, 0x24,
    ]);
  });

  it("pads utf8 strings to fixed byte lengths", () => {
    const bytes = toFixedBytes("abc", 8, "field");
    expect(bytes).toEqual([97, 98, 99, 0, 0, 0, 0, 0]);
  });

  it("accepts hex strings", () => {
    const bytes = toFixedBytes("0xaabb", 4, "field");
    expect(bytes).toEqual([170, 187, 0, 0]);
  });

  it("throws when value exceeds max bytes", () => {
    expect(() => toFixedBytes("abcdef", 4, "field")).toThrow(
      "field exceeds maximum length",
    );
  });

  it("encodes u64 seed bytes little-endian", () => {
    expect([...u64SeedBytes(258)]).toEqual([2, 1, 0, 0, 0, 0, 0, 0]);
  });

  it("encodes utf8 consistently", () => {
    expect([...utf8Bytes("entity")]).toEqual([101, 110, 116, 105, 116, 121]);
  });
});
