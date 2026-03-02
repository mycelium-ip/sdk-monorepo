import { PublicKey } from "@solana/web3.js";
import { IPCORE_PROGRAM_ID, SEEDS } from "../constants";
import * as anchor from "@coral-xyz/anchor";

export function deriveIPAssetPda(
  payer: PublicKey,
  ipIndex: anchor.BN,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.IP_ASSET),
      payer.toBuffer(),
      ipIndex.toArrayLike(Buffer, "le", 8),
    ],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveIpCounterPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.IP_COUNTER)],
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
  parentIpPda: PublicKey,
  childIpPda: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.DERIVATIVE_LINK),
      parentIpPda.toBuffer(),
      childIpPda.toBuffer(),
    ],
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
