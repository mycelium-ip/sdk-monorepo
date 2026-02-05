import { PublicKey } from "@solana/web3.js";
import { ENTITY_PROGRAM_ID, SEEDS } from "../constants";

export function deriveEntityPda(entityId: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.ENTITY), Buffer.from(entityId)],
    ENTITY_PROGRAM_ID,
  );
}

export function deriveEntityTreasuryPda(
  entity: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.ENTITY_TREASURY), entity.toBuffer()],
    ENTITY_PROGRAM_ID,
  );
}
