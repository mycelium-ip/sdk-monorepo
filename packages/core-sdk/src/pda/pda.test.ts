import { Keypair } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { sha256Hash, utf8Bytes } from "../utils/conversions";
import {
  deriveDerivativeLinkPda,
  deriveEntityMetadataPda,
  deriveEntityPda,
  deriveIpMetadataPda,
  deriveIpPda,
  deriveLicenseGrantPda,
  deriveLicensePda,
  deriveMetadataSchemaPda,
} from ".";

describe("pda helpers", () => {
  it("derive deterministic addresses for same inputs", () => {
    const creator = Keypair.generate().publicKey;
    const registrant = Keypair.generate().publicKey;
    const parentIp = Keypair.generate().publicKey;
    const childIp = Keypair.generate().publicKey;
    const grantee = Keypair.generate().publicKey;

    const [entityA] = deriveEntityPda(creator, "my-handle");
    const [entityB] = deriveEntityPda(creator, "my-handle");
    expect(entityA.toBase58()).toBe(entityB.toBase58());

    const contentHash = sha256Hash(utf8Bytes("my-content"));
    const [ipA] = deriveIpPda(registrant, contentHash);
    const [ipB] = deriveIpPda(registrant, contentHash);
    expect(ipA.toBase58()).toBe(ipB.toBase58());

    const [schemaA] = deriveMetadataSchemaPda("schema", "v1");
    const [schemaB] = deriveMetadataSchemaPda("schema", "v1");
    expect(schemaA.toBase58()).toBe(schemaB.toBase58());

    const [entityMetaA] = deriveEntityMetadataPda(entityA, 1);
    const [entityMetaB] = deriveEntityMetadataPda(entityA, 1);
    expect(entityMetaA.toBase58()).toBe(entityMetaB.toBase58());

    const [ipMetaA] = deriveIpMetadataPda(ipA, 2);
    const [ipMetaB] = deriveIpMetadataPda(ipA, 2);
    expect(ipMetaA.toBase58()).toBe(ipMetaB.toBase58());

    const [derivativeA] = deriveDerivativeLinkPda(parentIp, childIp);
    const [derivativeB] = deriveDerivativeLinkPda(parentIp, childIp);
    expect(derivativeA.toBase58()).toBe(derivativeB.toBase58());

    const [license] = deriveLicensePda(parentIp);
    const [grantA] = deriveLicenseGrantPda(license, grantee);
    const [grantB] = deriveLicenseGrantPda(license, grantee);
    expect(grantA.toBase58()).toBe(grantB.toBase58());
  });
});
