import { PublicKey } from "@solana/web3.js";
import { METADATA_PROGRAM_ID, SEEDS } from "../constants";

export function deriveSchemaPda(
  category: string,
  version: number,
): [PublicKey, number] {
  const categoryBuf = Buffer.from(category.trim().toLowerCase());

  const versionBuf = Buffer.alloc(2);
  versionBuf.writeUInt16LE(version);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.SCHEMA), categoryBuf, versionBuf],
    METADATA_PROGRAM_ID,
  );
}
