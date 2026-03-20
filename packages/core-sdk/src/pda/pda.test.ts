import { Keypair } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { getProgramIds } from "../constants/programs";
import { sha256Hash, utf8Bytes } from "../utils/bytes";
import {
  deriveCreatorEntityCounterPda,
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
    const { ipCore: ipCoreProgramId, license: licenseProgramId } =
      getProgramIds("devnet");
    const creator = Keypair.generate().publicKey;
    const registrant = Keypair.generate().publicKey;
    const parentIp = Keypair.generate().publicKey;
    const childIp = Keypair.generate().publicKey;
    const grantee = Keypair.generate().publicKey;

    const [entityA] = deriveEntityPda(creator, 0, ipCoreProgramId);
    const [entityB] = deriveEntityPda(creator, 0, ipCoreProgramId);
    expect(entityA.toBase58()).toBe(entityB.toBase58());

    // Different indices produce different PDAs
    const [entityC] = deriveEntityPda(creator, 1, ipCoreProgramId);
    expect(entityA.toBase58()).not.toBe(entityC.toBase58());

    const [counterA] = deriveCreatorEntityCounterPda(creator, ipCoreProgramId);
    const [counterB] = deriveCreatorEntityCounterPda(creator, ipCoreProgramId);
    expect(counterA.toBase58()).toBe(counterB.toBase58());

    const contentHash = sha256Hash(utf8Bytes("my-content"));
    const [ipA] = deriveIpPda(registrant, contentHash, ipCoreProgramId);
    const [ipB] = deriveIpPda(registrant, contentHash, ipCoreProgramId);
    expect(ipA.toBase58()).toBe(ipB.toBase58());

    const [schemaA] = deriveMetadataSchemaPda("schema", "v1", ipCoreProgramId);
    const [schemaB] = deriveMetadataSchemaPda("schema", "v1", ipCoreProgramId);
    expect(schemaA.toBase58()).toBe(schemaB.toBase58());

    const [entityMetaA] = deriveEntityMetadataPda(entityA, 1, ipCoreProgramId);
    const [entityMetaB] = deriveEntityMetadataPda(entityA, 1, ipCoreProgramId);
    expect(entityMetaA.toBase58()).toBe(entityMetaB.toBase58());

    const [ipMetaA] = deriveIpMetadataPda(ipA, 2, ipCoreProgramId);
    const [ipMetaB] = deriveIpMetadataPda(ipA, 2, ipCoreProgramId);
    expect(ipMetaA.toBase58()).toBe(ipMetaB.toBase58());

    const [derivativeA] = deriveDerivativeLinkPda(
      parentIp,
      childIp,
      ipCoreProgramId,
    );
    const [derivativeB] = deriveDerivativeLinkPda(
      parentIp,
      childIp,
      ipCoreProgramId,
    );
    expect(derivativeA.toBase58()).toBe(derivativeB.toBase58());

    const [license] = deriveLicensePda(parentIp, licenseProgramId);
    const [grantA] = deriveLicenseGrantPda(license, grantee, licenseProgramId);
    const [grantB] = deriveLicenseGrantPda(license, grantee, licenseProgramId);
    expect(grantA.toBase58()).toBe(grantB.toBase58());
  });
});
