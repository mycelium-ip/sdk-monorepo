import { PublicKey } from "@solana/web3.js";
import { IPCORE_PROGRAM_ID, SEEDS } from "../constants";
import * as anchor from "@coral-xyz/anchor";

export function deriveIPAssetPda(
  entity: PublicKey,
  ipIndex: anchor.BN,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.IP_ASSET),
      entity.toBuffer(),
      ipIndex.toArrayLike(Buffer, "le", 8),
    ],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveIpCounterPda(entity: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.IP_COUNTER), entity.toBuffer()],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveIPRegistryPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.IP_REGISTRY)],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveDerivativeLinkPda(
  parentIpId: bigint,
  childIpId: bigint,
): [PublicKey, number] {
  const parentBuf = Buffer.alloc(8);
  const childBuf = Buffer.alloc(8);

  parentBuf.writeBigUInt64LE(parentIpId);
  childBuf.writeBigUInt64LE(childIpId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.DERIVATIVE_LINK), parentBuf, childBuf],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveProvenanceClaimPda(
  ipAssetPda: PublicKey,
  evidenceHash: Buffer,
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.PROVENANCE), ipAssetPda.toBuffer(), evidenceHash],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveRegistryConfigPda() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.REGISTRY_CONFIG)],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveRegistryConfigTreasuryPda() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.REGISTRY_CONFIG_TREASURY)],
    IPCORE_PROGRAM_ID,
  );
}
