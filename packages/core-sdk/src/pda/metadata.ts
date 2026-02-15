import { PublicKey } from "@solana/web3.js";
import { METADATA_PROGRAM_ID, SEEDS } from "../constants";
import * as anchor from "@coral-xyz/anchor";

export function deriveEntityMetadataPda(
  entity: PublicKey,
  version: number,
): [PublicKey, number] {
  const versionBN = new anchor.BN(version);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.ENTITY_METADATA),
      entity.toBuffer(),
      versionBN.toArrayLike(Buffer, "le", 8),
    ],
    METADATA_PROGRAM_ID,
  );
}

export function deriveIPMetadataPda(
  ipAsset: PublicKey,
  version: number,
): [PublicKey, number] {
  const versionBN = new anchor.BN(version);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.IP_METADATA),
      ipAsset.toBuffer(),
      versionBN.toArrayLike(Buffer, "le", 8),
    ],
    METADATA_PROGRAM_ID,
  );
}
