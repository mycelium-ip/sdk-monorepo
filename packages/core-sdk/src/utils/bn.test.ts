import { describe, expect, it } from "vitest";
import { toI64Bn, toU64Bn } from "./bn";

describe("bn", () => {
  it("converts integer to u64 BN", () => {
    const bn = toU64Bn(42);
    expect(bn.toString()).toBe("42");
  });

  it("converts bigint to u64 BN", () => {
    const bn = toU64Bn(BigInt("18446744073709551615"));
    expect(bn.toString()).toBe("18446744073709551615");
  });

  it("throws for negative u64", () => {
    expect(() => toU64Bn(-1)).toThrow("must be >= 0");
  });

  it("throws for non-integer u64", () => {
    expect(() => toU64Bn(1.5)).toThrow("must be an integer");
  });

  it("converts integer to i64 BN", () => {
    const bn = toI64Bn(-100);
    expect(bn.toString()).toBe("-100");
  });

  it("converts positive integer to i64 BN", () => {
    const bn = toI64Bn(100);
    expect(bn.toString()).toBe("100");
  });

  it("throws for non-integer i64", () => {
    expect(() => toI64Bn(1.5)).toThrow("must be an integer");
  });
});
