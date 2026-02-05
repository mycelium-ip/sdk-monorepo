import { PublicKey } from "@solana/web3.js";
import { METADATA_PROGRAM_ID, SEEDS } from "../constants";

function normalizeVersion(version: string): Buffer {
  const v = version.trim().toLowerCase();
  if (!v) throw new Error("Metadata version cannot be empty");
  return Buffer.from(v);
}

export function deriveEntityMetadataPda(
  entity: PublicKey,
  version: string,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.ENTITY_METADATA),
      entity.toBuffer(),
      normalizeVersion(version),
    ],
    METADATA_PROGRAM_ID,
  );
}

export function deriveIPMetadataPda(
  ipAsset: PublicKey,
  version: string,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.IP_METADATA),
      ipAsset.toBuffer(),
      normalizeVersion(version),
    ],
    METADATA_PROGRAM_ID,
  );
}
