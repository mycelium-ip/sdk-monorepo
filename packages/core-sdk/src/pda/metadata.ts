import { PublicKey } from "@solana/web3.js";
import { PDA_SEEDS } from "../constants/programs";
import type { StringOrBytes } from "../types";
import { toFixedBytes, u64SeedBytes, utf8Bytes } from "../utils/bytes";

export function deriveMetadataSchemaPda(
  id: StringOrBytes,
  version: StringOrBytes,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      utf8Bytes(PDA_SEEDS.metadataSchema),
      Uint8Array.from(toFixedBytes(id, 32, "id")),
      Uint8Array.from(toFixedBytes(version, 16, "version")),
    ],
    programId,
  );
}

export function deriveEntityMetadataPda(
  entity: PublicKey,
  revision: bigint | number,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      utf8Bytes(PDA_SEEDS.metadata),
      utf8Bytes(PDA_SEEDS.entityKind),
      entity.toBytes(),
      u64SeedBytes(revision),
    ],
    programId,
  );
}

export function deriveIpMetadataPda(
  ip: PublicKey,
  revision: bigint | number,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      utf8Bytes(PDA_SEEDS.metadata),
      utf8Bytes(PDA_SEEDS.ipKind),
      ip.toBytes(),
      u64SeedBytes(revision),
    ],
    programId,
  );
}
