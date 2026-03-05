import { describe, expect, it } from "vitest";
import { toFixedBytes, u64SeedBytes, utf8Bytes } from "./conversions";

describe("conversions", () => {
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
