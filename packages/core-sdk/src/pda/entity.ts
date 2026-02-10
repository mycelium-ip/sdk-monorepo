import { PublicKey } from "@solana/web3.js";
import { ENTITY_PROGRAM_ID, SEEDS } from "../constants";
import * as anchor from "@coral-xyz/anchor";

export function deriveEntityPda(
  owner: PublicKey,
  entityIndex: anchor.BN,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.ENTITY),
      owner.toBuffer(),
      entityIndex.toArrayLike(Buffer, "le", 8),
    ],
    ENTITY_PROGRAM_ID,
  );
}

export function deriveEntityCounterPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.ENTITY_COUNTER), owner.toBuffer()],
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
